/**
 * EGS Dealer Dashboard - Interactive JavaScript Controllers
 */

document.addEventListener('DOMContentLoaded', () => {
    initSalesPerformanceChart();
});

let salesChartInstance = null;

function initSalesPerformanceChart() {
    const canvas = document.getElementById('salesPerformanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Gradient fill for golden curve line
    const goldGradient = ctx.createLinearGradient(0, 0, 0, 240);
    goldGradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
    goldGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    // Mock data matching the curve from the image
    const labels = [
        'Week 1', '', '', '',
        'Week 2', '', '', '',
        'Week 3', '', '', '',
        'Week 4', '', '', ''
    ];

    // Curve values simulating the zigzag up trend in the user screenshot
    const actualData = [
        1800, 2400, 3100, 3900, 4200, 3600, 3100, 3600, 3900, 4100, 4000, 4200, 4800, 5200, 5600, 6400, 5800, 5100, 5300, 4900, 4800, 5000
    ];

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '1 Jul', '3 Jul', '5 Jul', '7 Jul', '9 Jul', '11 Jul',
                '13 Jul', '15 Jul', '17 Jul', '19 Jul', '21 Jul', '23 Jul',
                '25 Jul', '27 Jul', '29 Jul', '31 Jul', '2 Aug', '4 Aug',
                '6 Aug', '8 Aug', '10 Aug', '12 Aug'
            ],
            datasets: [
                {
                    label: 'Actual Sales',
                    data: actualData,
                    borderColor: '#F59E0B', // Golden amber line
                    borderWidth: 2.5,
                    backgroundColor: goldGradient,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#F59E0B',
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0F172A',
                    titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` Actual: € ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                        color: '#94A3B8',
                        maxRotation: 0,
                        callback: function(val, index) {
                            if (index === 2) return 'Week 1';
                            if (index === 8) return 'Week 2';
                            if (index === 14) return 'Week 3';
                            if (index === 20) return 'Week 4';
                            return '';
                        }
                    }
                },
                y: {
                    grid: {
                        color: '#F1F5F9',
                        drawBorder: false
                    },
                    ticks: {
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                        color: '#94A3B8',
                        stepSize: 2000,
                        callback: function(value) {
                            if (value === 0) return '0';
                            return (value / 1000) + 'K';
                        }
                    },
                    min: 0,
                    max: 8000
                }
            }
        }
    });
}

function filterDashboardTable() {
    const input = document.getElementById('globalSearchInput');
    const query = input ? input.value.toLowerCase().trim() : '';
    const table = document.getElementById('dashboardStockTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function setBrandFilter(type, btn) {
    document.querySelectorAll('.segment-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const brandGrid = document.querySelector('.brand-cards-grid');
    if (!brandGrid) return;

    if (type === 'inactive') {
        brandGrid.innerHTML = `
            <div class="brand-tile">
                <div class="brand-logo-round" style="background:#475569;">TOYOTA</div>
                <div class="brand-title-name">Toyota</div>
                <div class="brand-units-count tabular">8 units</div>
            </div>
            <div class="brand-tile">
                <div class="brand-logo-round" style="background:#475569;">AUDI</div>
                <div class="brand-title-name">Audi</div>
                <div class="brand-units-count tabular">6 units</div>
            </div>
        `;
    } else {
        brandGrid.innerHTML = `
            <div class="brand-tile">
                <div class="brand-logo-round brand-fiat">FIAT</div>
                <div class="brand-title-name">Fiat Professional</div>
                <div class="brand-units-count tabular">24 units</div>
            </div>
            <div class="brand-tile">
                <div class="brand-logo-round brand-honda">H</div>
                <div class="brand-title-name">Honda</div>
                <div class="brand-units-count tabular">12 units</div>
            </div>
            <div class="brand-tile">
                <div class="brand-logo-round brand-mercedes">MB</div>
                <div class="brand-title-name">Mercedes-Benz</div>
                <div class="brand-units-count tabular">38 units</div>
            </div>
            <div class="brand-tile">
                <div class="brand-logo-round brand-porsche">P</div>
                <div class="brand-title-name">Porsche</div>
                <div class="brand-units-count tabular">16 units</div>
            </div>
        `;
    }
}

function updateDashboardPeriod(period) {
    if (!salesChartInstance) return;
    
    // Update chart data based on timeframe
    if (period === 'today') {
        salesChartInstance.data.datasets[0].data = [1200, 1800, 2400, 2900, 3100, 3400, 3900, 4200];
    } else if (period === 'this_week') {
        salesChartInstance.data.datasets[0].data = [2000, 3200, 2800, 4100, 4900, 5800, 6200];
    } else {
        salesChartInstance.data.datasets[0].data = [
            1800, 2400, 3100, 3900, 4200, 3600, 3100, 3600, 3900, 4100, 4000, 4200, 4800, 5200, 5600, 6400, 5800, 5100, 5300, 4900, 4800, 5000
        ];
    }
    salesChartInstance.update();
}

function openOrderOptions(ticketCode) {
    window.open(`/admin/booking_app/booking/?q=${ticketCode}`, '_blank');
}
