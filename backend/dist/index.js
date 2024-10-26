"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pcap_1 = __importDefault(require("pcap"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dns_1 = __importDefault(require("dns"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const reverseLookup = (0, util_1.promisify)(dns_1.default.reverse);
const trafficData = [];
const websites = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../node_modules/dns.json'), 'utf8'));
function ipToString(ip) {
    if (typeof ip === 'string')
        return ip;
    if (ip && ip.addr) {
        return ip.addr.join('.');
    }
    return 'Unknown';
}
const pcapSession = pcap_1.default.createSession('en0', {
    filter: 'tcp port 80 or tcp port 443'
});
pcapSession.on('packet', (rawPacket) => __awaiter(void 0, void 0, void 0, function* () {
    const packet = pcap_1.default.decode.packet(rawPacket);
    const ipHeader = packet.payload.payload;
    const srcPort = ipHeader.payload.sport;
    const dstPort = ipHeader.payload.dport;
    if (srcPort === 80 || srcPort === 443 || dstPort === 80 || dstPort === 443) {
        const srcIp = ipToString(ipHeader.saddr);
        const dstIp = ipToString(ipHeader.daddr);
        const website = websites[Math.floor(Math.random() * websites.length)];
        try {
            const domain = yield reverseLookup(dstIp);
            const data = {
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
        }
        catch (error) {
            const data = {
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
}));
app.get('/api/traffic', (req, res) => {
    res.status(200).json(trafficData);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
