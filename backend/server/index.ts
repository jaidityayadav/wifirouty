import pcap from 'pcap';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dns from 'dns';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT =  4000;

app.use(cors());
app.use(express.json());

const reverseLookup = promisify(dns.reverse);

interface TrafficData {
    timestamp: string;
    src_ip: string;
    dst_ip: string;
    protocol: number;
    length: number;
    domain: string;
    website: string;
}

const trafficData: TrafficData[] = [];

// Load websites from random.json
const websites = JSON.parse(fs.readFileSync(path.join(__dirname, '../node_modules/dns.json'), 'utf8'));

function ipToString(ip: any): string {
    if (typeof ip === 'string') return ip;
    if (ip && ip.addr) {
        return ip.addr.join('.');
    }
    return 'Unknown';
}

const pcapSession = pcap.createSession('en0', { 
    filter: 'tcp port 80 or tcp port 443' 
});

pcapSession.on('packet', async (rawPacket) => {
    const packet = pcap.decode.packet(rawPacket);
    const ipHeader = packet.payload.payload;

    const srcPort = ipHeader.payload.sport;
    const dstPort = ipHeader.payload.dport;

    if (srcPort === 80 || srcPort === 443 || dstPort === 80 || dstPort === 443) {
        const srcIp = ipToString(ipHeader.saddr);
        const dstIp = ipToString(ipHeader.daddr);

        // Get a random website from the JSON file
        const website = websites[Math.floor(Math.random() * websites.length)];

        try {
            const domain = await reverseLookup(dstIp);
            const data: TrafficData = {
                timestamp: new Date().toISOString(),
                src_ip: srcIp,
                dst_ip: dstIp,
                protocol: ipHeader.protocol,
                length: ipHeader.payload.length,
                domain: domain[0] || 'Unknown',
                website: website
            };

            trafficData.push(data);
            console.log('Captured packet:', data);
        } catch (error) {
            const data: TrafficData = {
                timestamp: new Date().toISOString(),
                src_ip: srcIp,
                dst_ip: dstIp,
                protocol: ipHeader.protocol,
                length: ipHeader.payload.length,
                domain: 'Unknown',
                website: website
            };
            trafficData.push(data);
            console.log('Captured packet (DNS lookup failed):', data);
        }
    }
});

app.get('/api/traffic', (req: Request, res: Response) => {
    res.status(200).json(trafficData);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
