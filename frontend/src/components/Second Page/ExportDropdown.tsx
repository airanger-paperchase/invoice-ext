// import React from 'react';

// interface ExportDropdownProps {
//     invoiceNo?: string;
//     dated?: string;
//     modeOfPayment?: string;
//     deliveryNoteDate?: string;
//     buyersOrderNo?: string;
//     dispatchThrough?: string;
//     pono?: string;
//     podate?: string;
// }

// const ExportDropdown: React.FC<ExportDropdownProps> = ({
//     invoiceNo = '',
//     dated = '',
//     modeOfPayment = '',
//     deliveryNoteDate = '',
//     buyersOrderNo = '',
//     dispatchThrough = '',
//     pono = '',
//     podate = ''
// }) => {
//     return (
//         <div className="flex flex-col">
//             <div className="flex space-x-6">
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Invoice No.</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-44 "
//                         value={invoiceNo}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Dated</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={dated}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Mode/Term of Payment</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={modeOfPayment}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Delivery Note Date</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={deliveryNoteDate}
//                         readOnly
//                     />
//                 </div>
//             </div>
//             <div className="flex space-x-6 pt-6">
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Buyer's Order No.</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={buyersOrderNo}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">Dispatch Through</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={dispatchThrough}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">PO No.</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={pono}
//                         readOnly
//                     />
//                 </div>
//                 <div className="flex flex-col">
//                     <label className="font-bold text-navyblue mb-1">PO Date</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 rounded-md p-2 w-32 "
//                         value={podate}
//                         readOnly
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExportDropdown;
