// ================================
// Detalhes do Chamado
// ================================

let currentTicket = null;
let selectedAnalyst = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeTicketDetails();
    setupFileUploadPreviews();
});

function initializeTicketDetails() {
    // Obter ID do chamado da URL
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');
    
    if (ticketId) {
        loadTicketDetails(ticketId);
    } else {
        showError('Chamado não encontrado');
        setTimeout(() => {
            window.location.href = 'fila-espera.html';
        }, 2000);
    }
    
    // Verificar permissões do usuário
    checkUserPermissions();
}

// ================================
// Carregar Detalhes do Chamado
// ================================

async function loadTicketDetails(ticketId) {
    try {
        showLoading();
        
        // Em produção, fazer chamada para API
        // const ticket = await fetchAPI(`/tickets/${ticketId}`);
        
        // Simulando dados
        currentTicket = getMockTicketDetails(ticketId);
        
        renderTicketDetails(currentTicket);
        loadTicketResponses(ticketId);
        
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar chamado:', error);
        hideLoading();
        showError('Erro ao carregar detalhes do chamado');
    }
}

function renderTicketDetails(ticket) {
    // ID
    document.getElementById('ticketId').textContent = ticket.id;
    
    // Título
    document.getElementById('ticketTitle').textContent = ticket.title;
    
    // Descrição
    document.getElementById('ticketDescription').textContent = ticket.description;
    
    // Autor
    document.getElementById('ticketAuthor').textContent = ticket.author;
    
    // Anexos (se houver)
    if (ticket.attachments && ticket.attachments.length > 0) {
        renderAttachments(ticket.attachments);
    }
}

function renderAttachments(attachments) {
    const container = document.getElementById('ticketAttachments');
    container.innerHTML = '';
    
    attachments.forEach(attachment => {
        const img = document.createElement('img');
        img.src = attachment.url;
        img.alt = attachment.name;
        img.className = 'attachment-image';
        img.onclick = () => openImageModal(attachment.url);
        container.appendChild(img);
    });
}

async function loadTicketResponses(ticketId) {
    try {
        // Em produção, fazer chamada para API
        // const responses = await fetchAPI(`/tickets/${ticketId}/responses`);
        
        const responses = getMockResponses();
        renderResponses(responses);
        
    } catch (error) {
        console.error('Erro ao carregar respostas:', error);
    }
}

function renderResponses(responses) {
    const container = document.getElementById('ticketResponses');
    
    if (!responses || responses.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; font-style: italic;">Nenhuma resposta ainda.</p>';
        return;
    }
    
    container.innerHTML = responses.map(response => `
        <div class="response-item">
            <div class="response-header">
                <span class="response-author">${response.author}</span>
                <span class="response-date">${formatResponseDate(response.createdAt)}</span>
            </div>
            <div class="response-title">${response.title}</div>
            <div class="response-text">${response.text}</div>
            ${response.attachments ? renderResponseAttachments(response.attachments) : ''}
        </div>
    `).join('');
}

function renderResponseAttachments(attachments) {
    return `
        <div class="ticket-attachments" style="margin-top: 1rem;">
            ${attachments.map(att => `
                <img src="${att.url}" alt="${att.name}" class="attachment-image" onclick="openImageModal('${att.url}')">
            `).join('')}
        </div>
    `;
}

// ================================
// Verificar Permissões
// ================================

function checkUserPermissions() {
    // Verificar se usuário é analista
    const isAnalyst = AppState.currentUser?.role === 'analyst';
    
    const btnCloseTicket = document.getElementById('btnCloseTicket');
    if (btnCloseTicket && !isAnalyst) {
        btnCloseTicket.style.display = 'none';
    }
}

// ================================
// Modals
// ================================

function openRespondModal() {
    const modal = document.getElementById('respondModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function openEditModal() {
    // Redirecionar para página de edição com dados preenchidos
    const ticketId = currentTicket.id;
    window.location.href = `editar-chamado.html?id=${ticketId}`;
}

function openCloseModal() {
    const isAnalyst = AppState.currentUser?.role === 'analyst';
    
    if (!isAnalyst) {
        showError('Apenas analistas podem encerrar chamados');
        return;
    }
    
    const modal = document.getElementById('closeModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function openForwardModal() {
    const modal = document.getElementById('forwardModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Carregar lista de analistas
    loadAnalystsList();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Limpar formulários
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Limpar previews de arquivo
    const previews = modal.querySelectorAll('.file-preview');
    previews.forEach(preview => preview.innerHTML = '');
}

// ================================
// Upload de Arquivos
// ================================

function setupFileUploadPreviews() {
    // Responder
    const respondAttachments = document.getElementById('responseAttachments');
    if (respondAttachments) {
        respondAttachments.addEventListener('change', (e) => {
            handleFilePreview(e.target.files, 'responseFilePreview');
        });
    }
    
    // Encerrar
    const closeAttachments = document.getElementById('closeAttachments');
    if (closeAttachments) {
        closeAttachments.addEventListener('change', (e) => {
            handleFilePreview(e.target.files, 'closeFilePreview');
        });
    }
}

function handleFilePreview(files, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'file-preview-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="file-preview-remove" onclick="removePreviewFile('${previewId}', ${index})">×</button>
                `;
                preview.appendChild(div);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

function removePreviewFile(previewId, index) {
    const preview = document.getElementById(previewId);
    const items = preview.querySelectorAll('.file-preview-item');
    if (items[index]) {
        items[index].remove();
    }
}

// ================================
// Submissões
// ================================

async function submitResponse(event) {
    event.preventDefault();
    
    const title = document.getElementById('responseTitle').value.trim();
    const description = document.getElementById('responseDescription').value.trim();
    const attachments = document.getElementById('responseAttachments').files;
    
    const responseData = {
        ticketId: currentTicket.id,
        title: title,
        text: description,
        author: AppState.currentUser?.name || 'Usuário',
        createdAt: new Date().toISOString(),
        attachments: [] // Em produção, fazer upload dos arquivos
    };
    
    try {
        showLoading();
        
        // Em produção, fazer upload de arquivos e enviar resposta
        // const response = await fetchAPI(`/tickets/${currentTicket.id}/responses`, {
        //     method: 'POST',
        //     body: JSON.stringify(responseData)
        // });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideLoading();
        showSuccess('Resposta enviada com sucesso!');
        closeModal('respondModal');
        
        // Recarregar respostas
        loadTicketResponses(currentTicket.id);
        
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        hideLoading();
        showError('Erro ao enviar resposta');
    }
}

async function submitCloseTicket(event) {
    event.preventDefault();
    
    const title = document.getElementById('closeTitle').value.trim();
    const description = document.getElementById('closeDescription').value.trim();
    const attachments = document.getElementById('closeAttachments').files;
    
    const closeData = {
        ticketId: currentTicket.id,
        title: title,
        resolution: description,
        closedBy: AppState.currentUser?.name || 'Analista',
        closedAt: new Date().toISOString(),
        attachments: []
    };
    
    try {
        showLoading();
        
        // Em produção, fazer upload de arquivos e encerrar chamado
        // const response = await fetchAPI(`/tickets/${currentTicket.id}/close`, {
        //     method: 'POST',
        //     body: JSON.stringify(closeData)
        // });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideLoading();
        showSuccess('Chamado encerrado com sucesso!');
        closeModal('closeModal');
        
        // Redirecionar para fila de espera
        setTimeout(() => {
            window.location.href = 'fila-espera.html';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao encerrar chamado:', error);
        hideLoading();
        showError('Erro ao encerrar chamado');
    }
}

// ================================
// Encaminhar Chamado
// ================================

async function loadAnalystsList() {
    try {
        // Em produção, fazer chamada para API
        // const analysts = await fetchAPI('/users/analysts');
        
        const analysts = getMockAnalysts();
        renderAnalystsList(analysts);
        
    } catch (error) {
        console.error('Erro ao carregar analistas:', error);
        showError('Erro ao carregar lista de analistas');
    }
}

function renderAnalystsList(analysts) {
    const container = document.getElementById('analystsList');
    
    container.innerHTML = analysts.map(analyst => `
        <div class="analyst-item" onclick="selectAnalyst('${analyst.id}', this)">
            <input type="radio" name="analyst" value="${analyst.id}" class="analyst-radio">
            <div class="analyst-info">
                <div class="analyst-name">${analyst.name}</div>
                <div class="analyst-email">${analyst.email}</div>
            </div>
        </div>
    `).join('');
}

function selectAnalyst(analystId, element) {
    // Remover seleção anterior
    document.querySelectorAll('.analyst-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Adicionar seleção atual
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    selectedAnalyst = analystId;
}

async function confirmForward() {
    if (!selectedAnalyst) {
        showError('Por favor, selecione um analista');
        return;
    }
    
    try {
        showLoading();
        
        const forwardData = {
            ticketId: currentTicket.id,
            fromAnalyst: AppState.currentUser?.id,
            toAnalyst: selectedAnalyst,
            forwardedAt: new Date().toISOString()
        };
        
        // Em produção, fazer chamada para API
        // await fetchAPI(`/tickets/${currentTicket.id}/forward`, {
        //     method: 'POST',
        //     body: JSON.stringify(forwardData)
        // });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideLoading();
        showSuccess('Chamado encaminhado com sucesso!');
        closeModal('forwardModal');
        
        // Redirecionar para fila de espera
        setTimeout(() => {
            window.location.href = 'fila-espera.html';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao encaminhar chamado:', error);
        hideLoading();
        showError('Erro ao encaminhar chamado');
    }
}

// ================================
// Visualização de Imagem
// ================================

function openImageModal(imageUrl) {
    // Criar modal para visualizar imagem em tamanho maior
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.style.cursor = 'pointer';
    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90vh; overflow: auto;">
            <img src="${imageUrl}" style="width: 100%; height: auto; border-radius: 8px;">
        </div>
    `;
    
    modal.onclick = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// ================================
// Dados Mock
// ================================

function getMockTicketDetails(ticketId) {
    return {
        id: ticketId,
        title: 'Estou com problema em criar um sistema em 3 plataformas com banco na nuvem antes de dezembro chegar',
        description: 'Preciso desenvolver um sistema que funcione em web, mobile e desktop, todos conectados a um banco de dados na nuvem. O prazo é apertado e estou tendo dificuldades com a sincronização dos dados entre as plataformas. Já tentei usar Firebase mas não consegui configurar corretamente. Alguém pode me ajudar com isso?',
        author: 'miguel',
        requester: 'Miguel Silva',
        category: 'software',
        status: 'Em andamento',
        priority: 'Alta',
        createdAt: '2025-10-15T10:30:00',
        attachments: []
    };
}

function getMockResponses() {
    return [
        {
            id: '1',
            title: 'Análise inicial do problema',
            text: 'Entendi seu problema. Vamos começar verificando a configuração do Firebase. Você já criou o projeto no console do Firebase? Preciso que me envie as configurações que você tentou usar.',
            author: 'João - Analista TI',
            createdAt: '2025-10-15T11:00:00',
            attachments: []
        },
        {
            id: '2',
            title: 'Documentação enviada',
            text: 'Segue em anexo um guia completo de como configurar Firebase para múltiplas plataformas. Siga os passos e me avise se tiver alguma dúvida.',
            author: 'João - Analista TI',
            createdAt: '2025-10-15T14:30:00',
            attachments: []
        }
    ];
}

function getMockAnalysts() {
    return [
        {
            id: 'analyst1',
            name: 'João Silva',
            email: 'joao.silva@empresa.com'
        },
        {
            id: 'analyst2',
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com'
        },
        {
            id: 'analyst3',
            name: 'Pedro Oliveira',
            email: 'pedro.oliveira@empresa.com'
        },
        {
            id: 'analyst4',
            name: 'Ana Costa',
            email: 'ana.costa@empresa.com'
        }
    ];
}

// Formatar data
function formatResponseDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
    if (days < 7) return `Há ${days} dia${days !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}