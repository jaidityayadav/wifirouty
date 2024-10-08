"use client";

import { useEffect, useState } from "react";

interface TrafficData {
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  protocol: number;
  length?: number; // Made optional to handle undefined
  domain: string;
  website: string; 
}

const Home = () => {
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/traffic');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTraffic(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching traffic data:', error);
        setLoading(false);
      }
    };

    const interval = setInterval(fetchTrafficData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getProtocolName = (protocol: number): string => {
    switch (protocol) {
      case 6: return 'TCP';
      case 17: return 'UDP';
      default: return protocol.toString();
    }
  };

  const currentEntries = traffic.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handlePageChange = (pageChange: number) => {
    setCurrentPage(prev => Math.max(0, Math.min(prev + pageChange, Math.ceil(traffic.length / itemsPerPage) - 1)));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      <div className="container mx-auto px-4 py-8 flex-grow w-full">
        <h1 className="text-5xl font-black mb-12 text-center text-purple-400 transition-colors duration-300 hover:text-purple-300">
          Traffic Dashboard
          <span className="text-2xl block font-normal mt-2">Monitoring Network Activity</span>
        </h1>
        {loading ? (
          <div className="text-center text-2xl animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <table className="w-full text-left divide-y divide-gray-700">
                <thead className="text-sm uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Source IP</th>
                    <th className="px-6 py-3">Destination IP</th>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Website</th>
                    <th className="px-6 py-3">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentEntries.map((item, index) => (
                    <tr key={index} className="transition-colors duration-300 hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4">{item.src_ip}</td>
                      <td className="px-6 py-4">{item.dst_ip}</td>
                      <td className="px-6 py-4">{item.domain || 'N/A'}</td>
                      <td className="px-6 py-4 text-ellipsis overflow-hidden max-w-[200px]">{item.website || 'N/A'}</td>
                      <td className="px-6 py-4">{getProtocolName(item.protocol)}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => handlePageChange(-1)} 
                disabled={currentPage === 0} 
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {currentPage + 1}</span>
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={(currentPage + 1) * itemsPerPage >= traffic.length} 
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
