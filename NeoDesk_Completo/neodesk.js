// ================================
// NeoDesk - Sistema Help Desk
// ================================

// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api', // Altere para o URL da sua API
    endpoints: {
        tickets: '/tickets',
        users: '/users',
        notifications: '/notifications',
        auth: '/auth'
    }
};

// Estado Global da Aplicação
const AppState = {
    currentUser: null,
    tickets: [],
    notifications: [],
    isOnline: navigator.onLine,
    currentPage: 'meus-chamados'
};

// ================================
// Inicialização
// ================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkConnection();
    loadUserData();
    loadNotifications();
});

function initializeApp() {
    console.log('NeoDesk inicializado');
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-icon-wrapper')) {
            closeAllDropdowns();
        }
    });
}

// ================================
// Event Listeners
// ================================
function setupEventListeners() {
    // Navegação principal
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.dataset.page) {
                handleNavigation(btn.dataset.page);
            }
        });
    });

    // Botão de notificações
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown('notificationsMenu');
        });
    }

    // Botão de configurações
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown('settingsMenu');
        });
    }

    // Botão de perfil
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown('profileMenu');
        });
    }

    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.ticket-row input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Monitorar conexão
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
}

// ================================
// Navegação
// ================================
function handleNavigation(page) {
    AppState.currentPage = page;
    
    // Atualizar botões ativos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });

    // Carregar conteúdo da página
    switch(page) {
        case 'meus-chamados':
            window.location.href = 'fila-espera.html';
            break;
        case 'dashboard':
            window.location.href = 'dashboard.html';
            break;
        case 'agenda':
            window.location.href = 'agenda.html';
            break;
        case 'abrir-chamado':
            window.location.href = 'abrir-chamado.html';
            break;
    }
}

// ================================
// Dropdown Menus
// ================================
function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const isOpen = menu.classList.contains('show');
    
    // Fechar todos os dropdowns
    closeAllDropdowns();
    
    // Abrir o dropdown clicado se estava fechado
    if (!isOpen) {
        menu.classList.add('show');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// ================================
// Gerenciamento de Usuário
// ================================
async function loadUserData() {
    try {
        // Simular carregamento de dados do usuário
        // Em produção, fazer chamada para API
        const userData = await fetchAPI('/users/me');
        
        AppState.currentUser = userData || {
            name: 'Nome do Usuário',
            email: 'usuario@email.com',
            role: 'analyst' // ou 'user'
        };

        // Atualizar UI
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name;
        if (userEmailEl) userEmailEl.textContent = AppState.currentUser.email;
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        // Usar dados mockados em caso de erro
        AppState.currentUser = {
            name: 'Nome do Usuário',
            email: 'usuario@email.com',
            role: 'analyst'
        };
    }
}

// ================================
// Gerenciamento de Chamados
// ================================
async function loadTickets() {
    try {
        showLoading();
        
        // Em produção, fazer chamada para API
        const tickets = await fetchAPI('/tickets');
        
        AppState.tickets = tickets || getMockTickets();
        
        renderTickets(AppState.tickets);
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        hideLoading();
        showError('Não foi possível carregar os chamados');
    }
}

function renderTickets(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = tickets.map(ticket => `
        <tr class="ticket-row" onclick="openTicket('${ticket.id}')">
            <td><input type="checkbox" onclick="event.stopPropagation()"></td>
            <td>${ticket.type}</td>
            <td>${ticket.id}</td>
            <td>${ticket.summary}</td>
            <td>${ticket.requester}</td>
            <td><span class="user-tag">@ ${ticket.assignee}</span></td>
            <td><span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
            <td>${formatDate(ticket.createdAt)}</td>
            <td>${ticket.deadline}</td>
            <td><span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
        </tr>
    `).join('');
}

function openTicket(ticketId) {
    console.log('Abrindo chamado:', ticketId);
    // Redirecionar para página de detalhes do chamado
    window.location.href = `chamado-detalhes.html?id=${ticketId}`;
}

// ================================
// Notificações
// ================================
async function loadNotifications() {
    try {
        // Em produção, fazer chamada para API
        const notifications = await fetchAPI('/notifications');
        
        AppState.notifications = notifications || getMockNotifications();
        
        updateNotificationBadge();
        renderNotifications();
        
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const unreadCount = AppState.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function renderNotifications() {
    const menu = document.getElementById('notificationsMenu');
    if (!menu) return;

    const notificationsHTML = AppState.notifications.map(notif => `
        <div class="notification-item" onclick="markAsRead('${notif.id}')">
            <p><strong>${notif.title}</strong></p>
            <p class="notification-text">${notif.message}</p>
            <span class="notification-time">${notif.time}</span>
        </div>
    `).join('');

    menu.innerHTML = `
        <div class="dropdown-header">Notificações</div>
        ${notificationsHTML || '<div class="notification-item">Nenhuma notificação</div>'}
    `;
}

function markAsRead(notificationId) {
    // Em produção, fazer chamada para API
    const notification = AppState.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
    }
}

// ================================
// Busca
// ================================
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query === '') {
        renderTickets(AppState.tickets);
        return;
    }

    const filtered = AppState.tickets.filter(ticket => 
        ticket.id.toLowerCase().includes(query) ||
        ticket.summary.toLowerCase().includes(query) ||
        ticket.requester.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query)
    );

    renderTickets(filtered);
}

// ================================
// Conexão com Internet
// ================================
function checkConnection() {
    AppState.isOnline = navigator.onLine;
    updateConnectionStatus();
}

function handleOnline() {
    AppState.isOnline = true;
    updateConnectionStatus();
    showSuccess('Conexão restaurada');
    // Recarregar dados se necessário
    if (typeof loadTickets === 'function') loadTickets();
}

function handleOffline() {
    AppState.isOnline = false;
    updateConnectionStatus();
}

function updateConnectionStatus() {
    const wifiIcon = document.getElementById('wifiIcon');
    const offlineMessage = document.getElementById('offlineMessage');
    
    if (AppState.isOnline) {
        wifiIcon?.classList.remove('offline');
        offlineMessage?.classList.remove('show');
    } else {
        wifiIcon?.classList.add('offline');
        offlineMessage?.classList.add('show');
    }
}

// ================================
// Ações de Configuração
// ================================
function changePassword() {
    console.log('Trocar senha');
    // Redirecionar para página de troca de senha
    window.location.href = 'trocar-senha.html';
}

function logout() {
    console.log('Logout');
    // Limpar dados locais
    AppState.currentUser = null;
    AppState.tickets = [];
    AppState.notifications = [];
    
    // Redirecionar para login
    window.location.href = 'login.html';
}

// ================================
// Funções de API
// ================================
async function fetchAPI(endpoint, options = {}) {
    if (!AppState.isOnline) {
        throw new Error('Sem conexão com a internet');
    }

    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            // Adicionar token de autenticação se necessário
            // 'Authorization': `Bearer ${getAuthToken()}`
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// ================================
// Funções Utilitárias
// ================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function showLoading() {
    // Implementar loading spinner
    console.log('Carregando...');
}

function hideLoading() {
    // Remover loading spinner
    console.log('Carregamento concluído');
}

function showSuccess(message) {
    console.log('Sucesso:', message);
    alert(message); // Substituir por toast/notification personalizado
}

function showError(message) {
    console.error('Erro:', message);
    alert(message); // Substituir por toast/notification personalizado
}

// ================================
// Dados Mock (para desenvolvimento)
// ================================
function getMockTickets() {
    return [
        {
            id: '0000001',
            type: 'Tipo de chamado',
            summary: 'Banco de dados corrompido',
            requester: 'Ator X',
            assignee: 'Miguel',
            status: 'Pendente',
            createdAt: '2025-07-16',
            deadline: '24h',
            priority: 'Alta'
        },
        {
            id: '0000002',
            type: 'Tipo de chamado',
            summary: 'Empresa pegando fogo',
            requester: 'Ator Y',
            assignee: 'Miguel',
            status: 'Pendente',
            createdAt: '2025-07-14',
            deadline: '96h',
            priority: 'Média'
        },
        {
            id: '0000003',
            type: 'Tipo de chamado',
            summary: 'Roteador com problemas',
            requester: 'Ator Z',
            assignee: 'Miguel',
            status: 'Solucionado',
            createdAt: '2025-07-15',
            deadline: '4h',
            priority: 'Média'
        },
        {
            id: '0000004',
            type: 'Tipo de chamado',
            summary: 'Rede desconectada',
            requester: 'Ator W',
            assignee: 'Miguel',
            status: 'Em andamento',
            createdAt: '2025-07-16',
            deadline: '8h',
            priority: 'Baixa'
        }
    ];
}

function getMockNotifications() {
    return [
        {
            id: '1',
            title: 'Novo chamado atribuído',
            message: 'Chamado #0000001 - Banco de dados corrompido',
            time: 'Há 5 minutos',
            read: false
        },
        {
            id: '2',
            title: 'Chamado atualizado',
            message: 'Chamado #0000002 - Empresa pegando fogo',
            time: 'Há 1 hora',
            read: false
        }
    ];
}