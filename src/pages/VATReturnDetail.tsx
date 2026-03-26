import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Info,
  AlertCircle,
  Download,
  FileText,
  Printer,
  ChevronRight,
  FileDown
} from 'lucide-react';
import { generateVAT201PDF } from '../lib/pdfGenerator';

const VATReturnDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Sales');
  const [loading, setLoading] = useState(true);
  const [returnDetails, setReturnDetails] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await dataService.getVATReturn(id);
        if (data) {
          setReturnDetails(data);
          // Fetch documents for this return
          const docs = await dataService.getDocumentsByVATReturn(id);
          setDocuments(docs);
        }
      } catch (error) {
        console.error("Error fetching VAT return:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!returnDetails) return;
    generateVAT201PDF(returnDetails);
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      await dataService.downloadDocument(docId);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Return Details...</div>;
  if (!returnDetails) return <div className="flex items-center justify-center h-screen">Return not found.</div>;

  const sections = [
    { id: 'Sales', title: 'VAT on Sales/Outputs' },
    { id: 'Expenses', title: 'VAT on Expenses/Inputs' },
    { id: 'NetDue', title: 'Net VAT Due' },
    { id: 'Declaration', title: 'Review & Declaration' },
    { id: 'Documents', title: 'Linked Documents' }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8F9FA]">
      {/* Breadcrumbs */}
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide no-scrollbar whitespace-nowrap shrink-0">
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat')}>VAT</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="cursor-pointer hover:text-[#B8860B]" onClick={() => navigate('/vat/services')}>VAT Services</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="text-gray-900">VAT 201 Return Detail</span>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate('/vat/services')} className="p-2 hover:bg-gray-100 rounded-lg transition-all shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#0A192F] uppercase">VAT 201 Return Detail</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                Filing for Period: {returnDetails.period} | VAT Ref: {returnDetails.vatRef}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50">
              <Printer size={14} />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-[#B8860B] text-white rounded text-[10px] font-bold hover:bg-[#9A6F09]"
            >
              <Download size={14} />
              <span className="whitespace-nowrap">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Header Info Card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-3 bg-[#0A192F] text-white flex items-center gap-2 col-span-2 sm:col-span-3 lg:col-span-1">
              <FileText size={16} />
              <span className="text-[10px] font-bold uppercase">Filing Status</span>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Current Status:</p>
              <span className={cn(
                "px-2 py-0.5 rounded-[4px] font-bold uppercase text-[8px]",
                returnDetails.status === 'Submitted' || returnDetails.status === 'Filed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              )}>
                {returnDetails.status || 'Draft'}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Period:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{returnDetails.period}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">VAT Return Due Date:</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{returnDetails.dueDate || '30 Mar 2026'}</p>
            </div>
            <div className="p-3">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Total Sales (AED):</p>
              <p className="text-[10px] font-bold text-[#0A192F]">{(returnDetails.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-[#B8860B]/10">
              <p className="text-[8px] font-bold text-[#B8860B] uppercase">Net VAT Payable:</p>
              <p className="text-[10px] font-black text-[#B8860B]">{(returnDetails.netVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide no-scrollbar shrink-0">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  "px-4 sm:px-6 py-3 text-[10px] font-bold uppercase transition-all border-b-2 whitespace-nowrap",
                  activeTab === s.id 
                    ? 'border-[#B8860B] text-[#B8860B] bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'Sales' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 rounded border border-blue-100 flex gap-3 text-blue-800 text-[11px]">
                  <Info size={16} className="shrink-0" />
                  <p>Details of all supplies of goods and services made during this tax period.</p>
                </div>
                
                <div className="overflow-x-auto scrollbar-hide no-scrollbar">
                  <table className="w-full text-[11px] min-w-[600px]">
                    <thead>
                      <tr className="text-left font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3">Description</th>
                        <th className="pb-3 text-right">Amount (AED)</th>
                        <th className="pb-3 text-right">VAT Amount (AED)</th>
                        <th className="pb-3 text-right">Adjustment (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { id: '1a', label: 'Standard rated supplies in Abu Dhabi', amount: returnDetails.formData?.sales?.standardRated?.abuDhabi?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.abuDhabi?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.abuDhabi?.adjustment || 0 },
                        { id: '1b', label: 'Standard rated supplies in Dubai', amount: returnDetails.formData?.sales?.standardRated?.dubai?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.dubai?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.dubai?.adjustment || 0 },
                        { id: '1c', label: 'Standard rated supplies in Sharjah', amount: returnDetails.formData?.sales?.standardRated?.sharjah?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.sharjah?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.sharjah?.adjustment || 0 },
                        { id: '1d', label: 'Standard rated supplies in Ajman', amount: returnDetails.formData?.sales?.standardRated?.ajman?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.ajman?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.ajman?.adjustment || 0 },
                        { id: '1e', label: 'Standard rated supplies in Umm Al Quwain', amount: returnDetails.formData?.sales?.standardRated?.ummAlQuwain?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.ummAlQuwain?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.ummAlQuwain?.adjustment || 0 },
                        { id: '1f', label: 'Standard rated supplies in Ras Al Khaimah', amount: returnDetails.formData?.sales?.standardRated?.rasAlKhaimah?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.rasAlKhaimah?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.rasAlKhaimah?.adjustment || 0 },
                        { id: '1g', label: 'Standard rated supplies in Fujairah', amount: returnDetails.formData?.sales?.standardRated?.fujairah?.amount || 0, vat: returnDetails.formData?.sales?.standardRated?.fujairah?.vat || 0, adj: returnDetails.formData?.sales?.standardRated?.fujairah?.adjustment || 0 },
                        { id: '2', label: 'Tax Refunds provided to Tourists under the Tax Refunds for Tourists Scheme*', amount: returnDetails.formData?.sales?.touristRefunds?.amount || 0, vat: returnDetails.formData?.sales?.touristRefunds?.vat || 0, adj: returnDetails.formData?.sales?.touristRefunds?.adjustment || 0 },
                        { id: '3', label: 'Supplies subject to the reverse charge provisions*', amount: returnDetails.formData?.sales?.reverseCharge?.amount || 0, vat: returnDetails.formData?.sales?.reverseCharge?.vat || 0, adj: 0 },
                        { id: '4', label: 'Zero rated supplies*', amount: returnDetails.formData?.sales?.zeroRated?.amount || 0, vat: 0, adj: 0 },
                        { id: '5', label: 'Exempt supplies*', amount: returnDetails.formData?.sales?.exempt?.amount || 0, vat: 0, adj: 0 },
                        { id: '6', label: 'Goods imported into the UAE*', amount: returnDetails.formData?.sales?.goodsImported?.amount || 0, vat: returnDetails.formData?.sales?.goodsImported?.vat || 0, adj: 0 },
                        { id: '7', label: 'Adjustments to goods imported into the UAE*', amount: returnDetails.formData?.sales?.adjustmentsImports?.amount || 0, vat: returnDetails.formData?.sales?.adjustmentsImports?.vat || 0, adj: 0 }
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-medium text-gray-700">
                            <span className="inline-block w-5 h-5 bg-gray-100 rounded text-[8px] flex items-center justify-center mr-2 float-left">{item.id}</span>
                            {item.label}
                          </td>
                          <td className="py-3 text-right text-gray-600">{(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-right font-bold text-[#0A192F]">{(item.vat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-right text-gray-400">{(item.adj || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#0A192F] text-white font-bold">
                        <td className="py-3 px-2">8. Totals</td>
                        <td className="py-3 text-right px-2">{(returnDetails.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right px-2">{(returnDetails.totalVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right px-2">0.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Expenses' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 rounded border border-blue-100 flex gap-3 text-blue-800 text-[11px]">
                  <Info size={16} className="shrink-0" />
                  <p>Details of all expenses and inputs incurred during this tax period on which you are claiming VAT recovery.</p>
                </div>
                
                <div className="overflow-x-auto scrollbar-hide no-scrollbar">
                  <table className="w-full text-[11px] min-w-[600px]">
                    <thead>
                      <tr className="text-left font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3">Description</th>
                        <th className="pb-3 text-right">Amount (AED)</th>
                        <th className="pb-3 text-right">Recoverable VAT (AED)</th>
                        <th className="pb-3 text-right">Adjustment (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { id: '9', label: 'Standard rated expenses*', amount: returnDetails.formData?.expenses?.standardRated?.amount || 0, vat: returnDetails.formData?.expenses?.standardRated?.vat || 0, adj: returnDetails.formData?.expenses?.standardRated?.adjustment || 0 },
                        { id: '10', label: 'Supplies subject to the reverse charge provisions*', amount: returnDetails.formData?.expenses?.reverseCharge?.amount || 0, vat: returnDetails.formData?.expenses?.reverseCharge?.vat || 0, adj: returnDetails.formData?.expenses?.reverseCharge?.adjustment || 0 }
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-medium text-gray-700">
                            <span className="inline-block w-5 h-5 bg-gray-100 rounded text-[8px] flex items-center justify-center mr-2 float-left">{item.id}</span>
                            {item.label}
                          </td>
                          <td className="py-3 text-right text-gray-600">{(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-right font-bold text-[#0A192F]">{(item.vat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-right text-gray-400">{(item.adj || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#0A192F] text-white font-bold">
                        <td className="py-3 px-2">11. Totals</td>
                        <td className="py-3 text-right px-2">{(returnDetails.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right px-2">{(returnDetails.totalRecoverableVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-right px-2">0.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'NetDue' && (
              <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8">
                <div className="bg-gray-50 p-4 sm:p-8 rounded border border-gray-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-4 border-b border-gray-200">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Total value of due tax for the period (12)</span>
                    <span className="text-base sm:text-lg font-bold text-[#0A192F]">AED {(returnDetails.totalVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-4 border-b border-gray-200">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Total value of recoverable tax for the period (13)</span>
                    <span className="text-base sm:text-lg font-bold text-[#0A192F]">AED {(returnDetails.totalRecoverableVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-4">
                    <span className="text-[11px] sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider">Payable tax for the period (14)</span>
                    <span className="text-xl sm:text-2xl font-black text-[#B8860B]">AED {(returnDetails.netVAT || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {returnDetails.formData?.refundRequest && (
                  <div className="p-4 border border-blue-100 bg-blue-50 rounded flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-900 uppercase">Refund requested?</span>
                    <span className="text-[10px] font-black text-blue-900 uppercase">{returnDetails.formData.refundRequest}</span>
                  </div>
                )}

                <div className="p-4 border border-orange-100 bg-orange-50 rounded flex gap-4">
                  <AlertCircle className="text-orange-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-[11px] font-bold text-orange-900 uppercase">Profit Margin Scheme</h4>
                    <p className="text-[10px] text-orange-800 mt-1">Are you entitled to use the Profit Margin Scheme? If yes, please ensure you have maintained all required records.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Declaration' && (
              <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[11px] font-bold text-[#0A192F] uppercase border-b border-gray-100 pb-2">Taxable Person Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Name</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">{user?.displayName || 'Taxable Person'}</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">TRN</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">{returnDetails.vatRef?.split('-')[1] || returnDetails.vatRef || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase">Address</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">Business Bay, Dubai, UAE</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-8 border-2 border-dashed border-gray-100 rounded bg-gray-50/50 space-y-6">
                  <h3 className="text-[11px] font-bold text-[#0A192F] uppercase text-center">Declaration and Authorized Signature</h3>
                  <p className="text-[10px] text-gray-500 text-center italic">
                    I hereby certify that the information provided in this return is true, correct, and complete to the best of my knowledge and belief.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Authorized Signatory</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">Mohammad Shafiulalam</p>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Date of Declaration</label>
                      <p className="text-[11px] font-bold text-[#0A192F]">{returnDetails.filedAt ? new Date(returnDetails.filedAt).toLocaleDateString() : format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Documents' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 rounded border border-blue-100 flex gap-3 text-blue-800 text-[11px]">
                  <Info size={16} className="shrink-0" />
                  <p>Documents uploaded and linked to this specific VAT return filing.</p>
                </div>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#B8860B] transition-all group bg-white shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-gray-50 rounded group-hover:bg-[#B8860B]/10 transition-colors">
                            <FileText size={24} className="text-gray-400 group-hover:text-[#B8860B]" />
                          </div>
                          <button 
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="p-2 text-gray-400 hover:text-[#B8860B] hover:bg-gray-50 rounded-full transition-all"
                            title="Download Document"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                        <h4 className="text-[11px] font-bold text-[#0A192F] truncate mb-1" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>{doc.fileType.split('/')[1] || 'FILE'}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase">No documents found</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Upload documents in the VAT Services section to link them to this return.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VATReturnDetail;
