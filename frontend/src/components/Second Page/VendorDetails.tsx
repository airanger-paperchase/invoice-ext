// import React from 'react';

// interface VendorDetailsProps {
//     buyerName?: string;
//     buyerAddress?: string;
//     gstin?: string;
//     stateName?: string;
//     stateCode?: string;
// }

// const VendorDetails: React.FC<VendorDetailsProps> = ({
//     buyerName = '',
//     buyerAddress = '',
//     gstin = '',
//     stateName = '',
//     stateCode = ''
// }) => {
//     return (
//         <div className="flex flex-col space-y-4">
//             <label className="font-bold text-navyblue mb-1">Buyer (Bill To):</label>
//             <div className="flex space-x-6">
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Name</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2"
//                         value={buyerName}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Address</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2"
//                         value={buyerAddress}
//                         readOnly
//                     />
//                 </div>
//             </div>
//             <div className="flex space-x-6 pt-2">
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">GSTIN/UIN</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2"
//                         value={gstin}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">State Name</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2"
//                         value={stateName}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">State Code</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2"
//                         value={stateCode}
//                         readOnly
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default VendorDetails;
