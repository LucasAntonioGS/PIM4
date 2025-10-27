// ================================
// Dashboard - Funções Específicas
// ================================

// Estado do Dashboard
const DashboardState = {
    startDate: '2025-02-28',
    endDate: '2025-05-14',
    statistics: {
        created: 0,
        inProgress: 0,
        closed: 0,
        pending: 0,
        overdue: 0,
        averageTime: '0h'
    },
    charts: {
        bar: null,
        pie1: null,
        pie2: null
    }
};

// Inicialização do Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    loadDashboardData();
});

function initializeDashboard() {
    console.log('Dashboard inicializado');
    
    // Configurar datas iniciais
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = DashboardState.startDate;
    if (endDateInput) endDateInput.value = DashboardState.endDate;
}

// ================================
// Carregamento de Dados
// ================================

async function loadDashboardData() {
    try {
        showLoading();
        
        // Em produção, fazer chamada para API
        const data = await fetchDashboardData();
        
        DashboardState.statistics = data || getMockDashboardData();
        
        updateDashboardCards();
        initializeCharts();
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        hideLoading();
        showError('Não foi possível carregar os dados do dashboard');
    }
}

async function fetchDashboardData() {
    // Em produção, substituir por chamada real à API
    // const response = await fetchAPI(`/dashboard/statistics?start=${DashboardState.startDate}&end=${DashboardState.endDate}`);
    // return response;
    
    // Simulando delay de rede
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getMockDashboardData());
        }, 500);
    });
}

// ================================
// Atualização de Cards
// ================================

function updateDashboardCards() {
    const stats = DashboardState.statistics;
    
    // Atualizar valores dos cards
    updateCardValue('createdTickets', stats.created);
    updateCardValue('progressTickets', stats.inProgress);
    updateCardValue('closedTickets', stats.closed);
    updateCardValue('pendingTickets', stats.pending);
    updateCardValue('overdueTickets', stats.overdue);
    updateCardValue('averageTime', stats.averageTime);
}

function updateCardValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Animação de contagem
        animateValue(element, 0, value, 1000);
    }
}

function animateValue(element, start, end, duration) {
    // Se o valor é string (como tempo), apenas atualizar
    if (typeof end === 'string') {
        element.textContent = end;
        return;
    }
    
    const range = end - start;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(progress * range + start);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// ================================
// Filtro por Datas
// ================================

function filterByDates() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Validação
    if (!startDate || !endDate) {
        alert('Por favor, selecione ambas as datas');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('A data inicial não pode ser maior que a data final');
        return;
    }
    
    // Atualizar estado
    DashboardState.startDate = startDate;
    DashboardState.endDate = endDate;
    
    // Recarregar dados
    console.log(`Filtrando de ${startDate} até ${endDate}`);
    loadDashboardData();
}

// ================================
// Download de Relatório
// ================================

function downloadReport() {
    console.log('Baixando relatório...');
    
    try {
        // Criar dados do relatório
        const reportData = generateReportData();
        
        // Criar CSV
        const csv = convertToCSV(reportData);
        
        // Download
        downloadCSV(csv, `relatorio-${DashboardState.startDate}-${DashboardState.endDate}.csv`);
        
        showSuccess('Relatório baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showError('Erro ao gerar relatório');
    }
}

function generateReportData() {
    const stats = DashboardState.statistics;
    
    return {
        periodo: {
            inicio: DashboardState.startDate,
            fim: DashboardState.endDate
        },
        estatisticas: {
            chamadosCriados: stats.created,
            emAndamento: stats.inProgress,
            fechados: stats.closed,
            pendentes: stats.pending,
            atrasados: stats.overdue,
            tempoMedio: stats.averageTime
        }
    };
}

function convertToCSV(data) {
    const lines = [];
    
    lines.push('NeoDesk - Relatório de Chamados\n');
    lines.push(`Período: ${data.periodo.inicio} até ${data.periodo.fim}\n`);
    lines.push('\nEstatísticas:');
    lines.push('Métrica,Valor');
    lines.push(`Chamados Criados,${data.estatisticas.chamadosCriados}`);
    lines.push(`Em Andamento,${data.estatisticas.emAndamento}`);
    lines.push(`Fechados,${data.estatisticas.fechados}`);
    lines.push(`Pendentes,${data.estatisticas.pendentes}`);
    lines.push(`Atrasados,${data.estatisticas.atrasados}`);
    lines.push(`Tempo Médio de Resolução,${data.estatisticas.tempoMedio}`);
    
    return lines.join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ================================
// Gráficos
// ================================

function initializeCharts() {
    // Verificar se a biblioteca de gráficos está disponível
    // Aqui você pode usar Chart.js, D3.js, ou outra biblioteca
    
    createBarChart();
    createPieChart1();
    createPieChart2();
}

function createBarChart() {
    const canvas = document.getElementById('barChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados mockados por período
    const data = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
        values: [25, 35, 45, 40, 30]
    };
    
    // Desenhar gráfico de barras simples
    drawBarChart(ctx, data);
}

function drawBarChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    const padding = 40;
    const barWidth = (width - padding * 2) / data.values.length;
    const maxValue = Math.max(...data.values);
    
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar barras
    data.values.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - padding * 2);
        const x = padding + index * barWidth + barWidth * 0.1;
        const y = height - padding - barHeight;
        
        // Gradiente
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        
        // Valor
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth * 0.4, y - 5);
        
        // Label
        ctx.fillStyle = '#6b7280';
        ctx.fillText(data.labels[index], x + barWidth * 0.4, height - padding + 20);
    });
}

function createPieChart1() {
    const canvas = document.getElementById('pieChart1Canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados de status
    const data = {
        labels: ['Pendente', 'Em Andamento', 'Fechado'],
        values: [
            DashboardState.statistics.pending,
            DashboardState.statistics.inProgress,
            DashboardState.statistics.closed
        ],
        colors: ['#ef4444', '#f59e0b', '#10b981']
    };
    
    drawPieChart(ctx, data);
}

function createPieChart2() {
    const canvas = document.getElementById('pieChart2Canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados de prioridade
    const data = {
        labels: ['Alta', 'Média', 'Baixa'],
        values: [15, 45, 25],
        colors: ['#dc2626', '#f59e0b', '#10b981']
    };
    
    drawPieChart(ctx, data);
}

function drawPieChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    ctx.clearRect(0, 0, width, height);
    
    const total = data.values.reduce((sum, val) => sum + val, 0);
    let currentAngle = -Math.PI / 2;
    
    // Desenhar fatias
    data.values.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = data.colors[index];
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Legenda
    const legendY = height - 30;
    const legendSpacing = width / data.labels.length;
    
    data.labels.forEach((label, index) => {
        const x = legendSpacing * index + legendSpacing / 2;
        
        // Cor
        ctx.fillStyle = data.colors[index];
        ctx.fillRect(x - 30, legendY, 15, 15);
        
        // Texto
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x - 10, legendY + 12);
    });
}

// ================================
// Dados Mock
// ================================

function getMockDashboardData() {
    return {
        created: 125,
        inProgress: 45,
        closed: 68,
        pending: 12,
        overdue: 8,
        averageTime: '4.5h'
    };
}

// ================================
// Redimensionamento de Gráficos
// ================================

window.addEventListener('resize', debounce(() => {
    initializeCharts();
}, 300));