from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class InvoiceLineItem(BaseModel):
    product_name: str
    product_code: Optional[str]
    quantity: float
    unit_price: float
    unit_of_measurement: Optional[str]
    per_line_item_tax: Optional[float]
    amount: float
    vat_tax_amount: Optional[float]

class InvoiceHeader(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: date
    tax_total_amount: float
    sub_total_amount: float
    invoice_total: float

class InvoiceData(BaseModel):
    header: InvoiceHeader
    line_items: List[InvoiceLineItem] 