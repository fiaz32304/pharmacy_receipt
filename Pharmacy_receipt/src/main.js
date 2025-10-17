import './styles.css'
import { getReceipts, addReceipt } from './api.js'

// DOM Elements
const receiptForm = document.getElementById('receipt-form')
const receiptsList = document.getElementById('receipts-list')
const loadingIndicator = document.getElementById('loading')
const alertContainer = document.getElementById('alert-container')
const submitBtn = document.getElementById('submit-btn')
const submitText = document.getElementById('submit-text')
const submitSpinner = document.getElementById('submit-spinner')
const medicineItemsContainer = document.getElementById('medicine-items-container')
const addMedicineBtn = document.getElementById('add-medicine-btn')
const totalInput = document.getElementById('total')

// Show alert message
function showAlert(message, type) {
  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `
  alertContainer.innerHTML = alertHTML
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    const alert = alertContainer.querySelector('.alert')
    if (alert) {
      alert.remove()
    }
  }, 5000)
}

// Show loading indicator
function showLoading() {
  loadingIndicator.classList.remove('d-none')
}

// Hide loading indicator
function hideLoading() {
  loadingIndicator.classList.add('d-none')
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Format date
function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

// Add new medicine input row
function addMedicineRow() {
  const medicineRow = document.createElement('div')
  medicineRow.className = 'medicine-item-row row mb-2'
  medicineRow.innerHTML = `
    <div class="col-md-5 mb-2 mb-md-0">
      <input type="text" class="form-control medicine-name" placeholder="Medicine name" required>
    </div>
    <div class="col-md-2 mb-2 mb-md-0">
      <input type="number" class="form-control medicine-qty" placeholder="Qty" min="1" value="1" required>
    </div>
    <div class="col-md-3 mb-2 mb-md-0">
      <div class="input-group">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control medicine-price" placeholder="Price" step="0.01" min="0" required>
      </div>
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-outline-danger remove-medicine w-100"><i class="bi bi-trash"></i></button>
    </div>
  `
  medicineItemsContainer.appendChild(medicineRow)
  
  // Add event listener to remove button
  const removeBtn = medicineRow.querySelector('.remove-medicine')
  removeBtn.addEventListener('click', () => {
    if (medicineItemsContainer.children.length > 1) {
      medicineRow.remove()
      calculateTotal()
    } else {
      showAlert('At least one medicine item is required', 'warning')
    }
  })
  
  // Add event listeners to calculate total when inputs change
  const qtyInput = medicineRow.querySelector('.medicine-qty')
  const priceInput = medicineRow.querySelector('.medicine-price')
  
  qtyInput.addEventListener('input', calculateTotal)
  priceInput.addEventListener('input', calculateTotal)
}

// Calculate total amount from medicine items
function calculateTotal() {
  let total = 0
  const medicineRows = document.querySelectorAll('.medicine-item-row')
  
  medicineRows.forEach(row => {
    const qty = parseFloat(row.querySelector('.medicine-qty').value) || 0
    const price = parseFloat(row.querySelector('.medicine-price').value) || 0
    total += qty * price
  })
  
  totalInput.value = total.toFixed(2)
}

// Generate receipt content as HTML string
function generateReceiptHTML(receipt) {
  // Parse items if it's a string, otherwise use as is
  let items = receipt.items
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items)
    } catch (e) {
      items = []
    }
  }
  
  const itemsHTML = Array.isArray(items) ? items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.qty * item.price)}</td>
    </tr>
  `).join('') : ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${receipt.pharmacy_name}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-item { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; font-size: 1.2em; }
        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${receipt.pharmacy_name}</h1>
        <p>Receipt</p>
      </div>
      
      <div class="receipt-info">
        <div>
          <div class="info-item"><strong>Patient:</strong> ${receipt.patient_name}</div>
          <div class="info-item"><strong>Date:</strong> ${formatDate(receipt.created_at)}</div>
        </div>
        <div>
          <div class="info-item"><strong>Receipt ID:</strong> ${receipt.id}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="total">
        Total: ${formatCurrency(receipt.total)}
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer generated receipt</p>
      </div>
    </body>
    </html>
  `
}

// Download receipt as HTML file
function downloadReceipt(receipt) {
  const receiptHTML = generateReceiptHTML(receipt)
  const blob = new Blob([receiptHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${receipt.id}.html`
  document.body.appendChild(a)
  a.click()
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

// Print receipt (SMS-style printing)
function printReceipt(receipt) {
  const printWindow = window.open('', '_blank');
  const printContent = generateReceiptHTML(receipt);
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

// Render receipts with improved styling
function renderReceipts(receipts) {
  if (receipts.length === 0) {
    receiptsList.innerHTML = '<p class="text-muted text-center py-4">No receipts found.</p>'
    return
  }

  const receiptsHTML = receipts.map(receipt => {
    // Parse items if it's a string, otherwise use as is
    let items = receipt.items
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch (e) {
        items = []
      }
    }
    
    // Create separate displays for medicines and quantities
    const medicinesList = Array.isArray(items) ? items.map(item => `
      <div class="medicine-item d-flex justify-content-between py-1 border-bottom">
        <span>${item.name}</span>
        <span>${item.qty} × ${formatCurrency(item.price)}</span>
      </div>
    `).join('') : ''
    
    const quantitiesList = Array.isArray(items) ? items.map(item => `
      <div class="quantity-item d-flex justify-content-between py-1 border-bottom">
        <span>${item.name}</span>
        <span>${item.qty}</span>
      </div>
    `).join('') : ''
    
    return `
      <div class="receipt-card card mb-3 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="card-title text-primary">${receipt.pharmacy_name}</h5>
              <p class="card-text mb-1"><i class="bi bi-person me-2"></i><strong>Patient:</strong> ${receipt.patient_name}</p>
              <p class="card-text text-muted small mb-0"><i class="bi bi-calendar me-2"></i>${formatDate(receipt.created_at)}</p>
            </div>
            <div class="text-end">
              <span class="badge bg-success fs-6">${formatCurrency(receipt.total)}</span>
              <p class="text-muted small mb-0">ID: ${receipt.id.substring(0, 8)}</p>
            </div>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-6">
              <h6 class="text-muted">Medicines</h6>
              <div class="medicines-list bg-light p-2 rounded">
                ${medicinesList || '<p class="text-muted mb-0">No medicines listed</p>'}
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted">Quantities</h6>
              <div class="quantities-list bg-light p-2 rounded">
                ${quantitiesList || '<p class="text-muted mb-0">No quantities listed</p>'}
              </div>
            </div>
          </div>
          
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary download-btn flex-fill" data-receipt-id="${receipt.id}">
              <i class="bi bi-download me-1"></i> Download
            </button>
            <button class="btn btn-sm btn-outline-secondary print-btn flex-fill" data-receipt-id="${receipt.id}">
              <i class="bi bi-printer me-1"></i> Print
            </button>
          </div>
        </div>
      </div>
    `
  }).join('')
  
  receiptsList.innerHTML = receiptsHTML
  
  // Add event listeners to download buttons
  document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const receiptId = e.target.closest('.download-btn').dataset.receiptId
      const receipt = receipts.find(r => r.id === receiptId)
      if (receipt) {
        downloadReceipt(receipt)
      }
    })
  })
  
  // Add event listeners to print buttons
  document.querySelectorAll('.print-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const receiptId = e.target.closest('.print-btn').dataset.receiptId
      const receipt = receipts.find(r => r.id === receiptId)
      if (receipt) {
        printReceipt(receipt)
      }
    })
  })
}

// Load receipts from Supabase
async function loadReceipts() {
  try {
    showLoading()
    const receipts = await getReceipts()
    renderReceipts(receipts)
  } catch (error) {
    console.error('Error loading receipts:', error)
    showAlert('Failed to load receipts. Please try again.', 'danger')
    receiptsList.innerHTML = '<p class="text-danger text-center py-4">Failed to load receipts.</p>'
  } finally {
    hideLoading()
  }
}

// Add event listener to add medicine button
addMedicineBtn.addEventListener('click', addMedicineRow)

// Add event listener to remove medicine buttons for existing rows
document.querySelectorAll('.remove-medicine').forEach(button => {
  button.addEventListener('click', function() {
    if (medicineItemsContainer.children.length > 1) {
      this.closest('.medicine-item-row').remove()
      calculateTotal()
    } else {
      showAlert('At least one medicine item is required', 'warning')
    }
  })
})

// Add event listeners to existing medicine rows to calculate total
document.querySelectorAll('.medicine-item-row').forEach(row => {
  const qtyInput = row.querySelector('.medicine-qty')
  const priceInput = row.querySelector('.medicine-price')
  
  qtyInput.addEventListener('input', calculateTotal)
  priceInput.addEventListener('input', calculateTotal)
})

// Handle form submission
receiptForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  // Get form values
  const pharmacyName = document.getElementById('pharmacy-name').value
  const patientName = document.getElementById('patient-name').value
  
  // Get medicine items
  const medicineRows = document.querySelectorAll('.medicine-item-row')
  const items = []
  
  medicineRows.forEach(row => {
    const name = row.querySelector('.medicine-name').value
    const qty = parseInt(row.querySelector('.medicine-qty').value)
    const price = parseFloat(row.querySelector('.medicine-price').value)
    
    if (name && !isNaN(qty) && !isNaN(price)) {
      items.push({
        name: name,
        qty: qty,
        price: price
      })
    }
  })
  
  const total = parseFloat(totalInput.value)
  
  // Validate required fields
  if (!pharmacyName || !patientName || items.length === 0 || isNaN(total)) {
    showAlert('Please fill in all required fields.', 'danger')
    return
  }
  
  // Disable submit button and show spinner
  submitBtn.disabled = true
  submitText.textContent = 'Adding...'
  submitSpinner.classList.remove('d-none')
  
  try {
    // Add receipt to Supabase
    const newReceipt = await addReceipt({
      pharmacy_name: pharmacyName,
      patient_name: patientName,
      items: items,
      total: total
    })
    
    // Show success message
    showAlert('Receipt added successfully!', 'success')
    
    // Print receipt (SMS-style printing)
    printReceipt(newReceipt)
    
    // Reset form
    receiptForm.reset()
    
    // Reset medicine items to one row
    medicineItemsContainer.innerHTML = `
      <div class="medicine-item-row row mb-2">
        <div class="col-md-5 mb-2 mb-md-0">
          <input type="text" class="form-control medicine-name" placeholder="Medicine name" required>
        </div>
        <div class="col-md-2 mb-2 mb-md-0">
          <input type="number" class="form-control medicine-qty" placeholder="Qty" min="1" value="1" required>
        </div>
        <div class="col-md-3 mb-2 mb-md-0">
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control medicine-price" placeholder="Price" step="0.01" min="0" required>
          </div>
        </div>
        <div class="col-md-2">
          <button type="button" class="btn btn-outline-danger remove-medicine w-100"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `
    
    // Re-attach event listeners to new remove buttons
    document.querySelectorAll('.remove-medicine').forEach(button => {
      button.addEventListener('click', function() {
        if (medicineItemsContainer.children.length > 1) {
          this.closest('.medicine-item-row').remove()
          calculateTotal()
        } else {
          showAlert('At least one medicine item is required', 'warning')
        }
      })
    })
    
    // Re-attach event listeners to new medicine rows
    document.querySelectorAll('.medicine-item-row').forEach(row => {
      const qtyInput = row.querySelector('.medicine-qty')
      const priceInput = row.querySelector('.medicine-price')
      
      qtyInput.addEventListener('input', calculateTotal)
      priceInput.addEventListener('input', calculateTotal)
    })
    
    // Reload receipts
    await loadReceipts()
  } catch (error) {
    console.error('Error adding receipt:', error)
    showAlert(`Failed to add receipt: ${error.message}`, 'danger')
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false
    submitText.textContent = 'Add Receipt'
    submitSpinner.classList.add('d-none')
  }
})

// Initial load of receipts
loadReceipts()