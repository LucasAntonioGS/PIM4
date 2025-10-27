// ================================
// Abrir Chamado - Funções Específicas
// ================================

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeTicketForm();
});

function initializeTicketForm() {
    console.log('Formulário de chamado inicializado');
    
    // Adicionar validação em tempo real
    setupFormValidation();
    
    // Auto-resize do textarea
    setupTextareaAutoResize();
}

// ================================
// Validação do Formulário
// ================================

function setupFormValidation() {
    const form = document.getElementById('ticketForm');
    if (!form) return;
    
    // Validar campos ao perder o foco
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    // Validação específica por tipo
    if (field.id === 'problemTitle' && value.length < 5) {
        showFieldError(field, 'O título deve ter pelo menos 5 caracteres');
        return false;
    }
    
    if (field.id === 'problemDetails' && value.length < 20) {
        showFieldError(field, 'Por favor, forneça mais detalhes sobre o problema');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('field-error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    
    const errorMessage = field.parentElement.querySelector('.field-error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// ================================
// Auto-resize do Textarea
// ================================

function setupTextareaAutoResize() {
    const textarea = document.getElementById('problemDetails');
    if (!textarea) return;
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// ================================
// Submissão do Formulário
// ================================

function submitTicket(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Validar todos os campos
    let isValid = true;
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showError('Por favor, corrija os erros no formulário');
        return;
    }
    
    // Coletar dados do formulário
    const ticketData = {
        title: document.getElementById('problemTitle').value.trim(),
        category: document.getElementById('category').value,
        affects: document.getElementById('affects').value,
        description: document.getElementById('problemDetails').value.trim(),
        createdAt: new Date().toISOString(),
        status: 'pendente',
        requester: AppState.currentUser?.name || 'Usuário'
    };
    
    console.log('Dados do chamado:', ticketData);
    
    // Enviar para API
    createTicket(ticketData);
}

async function createTicket(ticketData) {
    try {
        showLoading();
        
        // Em produção, fazer chamada para API
        // const response = await fetchAPI('/tickets', {
        //     method: 'POST',
        //     body: JSON.stringify(ticketData)
        // });
        
        // Simulando delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideLoading();
        showSuccess('Chamado criado com sucesso!');
        
        // Limpar formulário
        document.getElementById('ticketForm').reset();
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
            window.location.href = 'fila-espera.html';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        hideLoading();
        showError('Erro ao criar chamado. Tente novamente.');
    }
}

// ================================
// Fechar Formulário
// ================================

function closeTicketForm() {
    const form = document.getElementById('ticketForm');
    
    // Verificar se há dados não salvos
    const hasData = form.querySelector('input, textarea').value.trim() !== '';
    
    if (hasData) {
        const confirm = window.confirm('Deseja realmente sair? Os dados não salvos serão perdidos.');
        if (!confirm) return;
    }
    
    // Redirecionar para página anterior ou fila de espera
    window.history.back();
}

// ================================
// Estilos de Erro (adicionar ao CSS via JavaScript)
// ================================

// Adicionar estilos dinâmicos para erros de validação
const style = document.createElement('style');
style.textContent = `
    .field-error {
        border-color: #ef4444 !important;
    }
    
    .field-error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .field-error-message {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .field-error-message::before {
        content: "⚠";
    }
`;
document.head.appendChild(style);