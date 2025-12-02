import React from 'react';
import { Award, Plus, Download } from 'lucide-react';

const Certificates = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600">Manage SSL certificates and security credentials</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus size={16} className="mr-2" />
          Issue Certificate
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Award size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates</h3>
            <p className="text-gray-600">Start by issuing your first certificate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
