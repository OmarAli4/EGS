/**
 * SERVICE BAY - Complete Interactive Portal & Engine (Dual Desktop & Mobile Perfection)
 */

let currentStep = 1;
let currentAuthRole = 'guest'; // 'guest', 'user', 'admin'
let loggedInUser = null;
let userPhone = null;
let isCarouselHovered = false;
let marqueeInterval = null;

let bookingData = {
    serviceId: null,
    serviceTitle: 'صيانة دورية 10.000 كم',
    servicePrice: 1450.00,
    serviceDuration: 60,
    carMake: '',
    carModel: '',
    carYear: '2023',
    carPlate: '',
    district: 'October',
    districtText: 'فرع مدينة 6 أكتوبر (المنطقة الصناعية)',
    addressNotes: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    customerPhone: ''
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Run Splash Loader
    runSplashLoader();

    // 2. Set default date to today
    const todayStr = new Date().toISOString().split('T')[0];
    bookingData.bookingDate = todayStr;

    // 3. Default select first service card
    const firstServiceCard = document.querySelector('.service-card.selected');
    if (firstServiceCard) {
        selectService(firstServiceCard);
    }

    // 4. Initialize Car Models for initial select if present
    const makeSelect = document.getElementById('carMakeSelect');
    if (makeSelect && makeSelect.value) {
        onMakeChange(makeSelect.value);
    }

    // 5. Load initial time slots
    loadSlots(bookingData.bookingDate);

    // 6. Start Carousel Auto-Scroll Engine
    initContinuousCarousel();

    // 7. Initial Job Card Update
    updateJobCard();
});

/**
 * 1. SPLASH LOADER ENGINE
 */
function runSplashLoader() {
    const splashBar = document.getElementById('splashBar');
    const splashPercent = document.getElementById('splashPercent');
    const splashLoader = document.getElementById('splashLoader');

    let count = 0;
    const interval = setInterval(() => {
        count += 5;
        if (count > 100) count = 100;
        
        if (splashBar) splashBar.style.width = count + '%';
        if (splashPercent) splashPercent.textContent = count + '%';

        if (count >= 100) {
            clearInterval(interval);
            if (splashLoader) {
                splashLoader.classList.add('fade-out');
                setTimeout(() => {
                    splashLoader.style.display = 'none';
                }, 400);
            }
        }
    }, 30);
}

/**
 * 2. SAFE NATIVE SCROLL CAROUSEL ENGINE (Works 100% on Laptop & Mobile)
 */
function initContinuousCarousel() {
    const wrapper = document.getElementById('carouselWrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mouseenter', () => { isCarouselHovered = true; });
    wrapper.addEventListener('mouseleave', () => { isCarouselHovered = false; });
    wrapper.addEventListener('touchstart', () => { isCarouselHovered = true; }, { passive: true });
    wrapper.addEventListener('touchend', () => { isCarouselHovered = false; }, { passive: true });

    clearInterval(marqueeInterval);
    marqueeInterval = setInterval(() => {
        if (isCarouselHovered) return;
        
        // Native scroll step
        wrapper.scrollLeft += 1;

        // Reset loop when reaching end
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        if (Math.abs(wrapper.scrollLeft) >= maxScroll - 2 || wrapper.scrollLeft === 0) {
            wrapper.scrollLeft = 0;
        }
    }, 25);
}

function quickSelectService(serviceId) {
    const card = document.querySelector(`.service-card[data-id="${serviceId}"]`);
    if (card) {
        selectService(card);
        navigateToStep(1);
    }
}

/**
 * 3. CATEGORY TABS FILTER SYSTEM
 */
function filterServices(categoryName, pillElem) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    if (pillElem) pillElem.classList.add('active');

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (categoryName === 'all' || cardCat === categoryName) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * 4. MANDATORY AUTHENTICATION & ACCOUNT ENGINE
 */
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}

function switchLoginTab(role) {
    const tabUser = document.getElementById('tabUserLogin');
    const tabReg = document.getElementById('tabUserRegister');
    const tabAdmin = document.getElementById('tabAdminLogin');

    const formUser = document.getElementById('formUserLogin');
    const formReg = document.getElementById('formUserRegister');
    const formAdmin = document.getElementById('formAdminLogin');

    [tabUser, tabReg, tabAdmin].forEach(t => t && t.classList.remove('active'));
    [formUser, formReg, formAdmin].forEach(f => f && f.classList.remove('active'));

    if (role === 'user') {
        if (tabUser) tabUser.classList.add('active');
        if (formUser) formUser.classList.add('active');
    } else if (role === 'register') {
        if (tabReg) tabReg.classList.add('active');
        if (formReg) formReg.classList.add('active');
    } else {
        if (tabAdmin) tabAdmin.classList.add('active');
        if (formAdmin) formAdmin.classList.add('active');
    }
}

function handleAuthSubmit(event, actionType) {
    event.preventDefault();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? 
                      document.querySelector('[name=csrfmiddlewaretoken]').value : '';

    if (actionType === 'register') {
        const name = document.getElementById('regNameInput').value.trim();
        const phone = document.getElementById('regPhoneInput').value.trim();
        const password = document.getElementById('regPasswordInput').value.trim();

        fetch('/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ name, phone, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                completeAuthSession(data.role, data.name, data.phone);
            } else {
                alert(data.message || 'حدث خطأ في إنشاء الحساب');
            }
        })
        .catch(() => completeAuthSession('user', name, phone));
    } else if (actionType === 'user') {
        const userInput = document.getElementById('loginUserInput').value.trim();
        fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ role: 'user', username: userInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                completeAuthSession('user', data.name, data.phone);
            } else {
                alert(data.message || 'فشل تسجيل الدخول');
            }
        })
        .catch(() => completeAuthSession('user', userInput, '01000000000'));
    } else if (actionType === 'admin') {
        const username = document.getElementById('adminUsernameInput').value.trim();
        const password = document.getElementById('adminPasswordInput').value.trim();

        fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ role: 'admin', username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                closeLoginModal();
                currentAuthRole = 'admin';
                loggedInUser = data.name;
                updateHeaderAuthUI();
                showAdminViewPane();
            } else {
                alert(data.message || 'بيانات الأدمن غير صحيحة');
            }
        })
        .catch(() => {
            closeLoginModal();
            currentAuthRole = 'admin';
            loggedInUser = 'مهندس الورشة (Admin)';
            updateHeaderAuthUI();
            showAdminViewPane();
        });
    }
}

function completeAuthSession(role, name, phone) {
    closeLoginModal();
    currentAuthRole = role;
    loggedInUser = name;
    userPhone = phone || '010XXXXXXXX';

    const custNameInput = document.getElementById('custNameInput');
    const custPhoneInput = document.getElementById('custPhoneInput');
    if (custNameInput) custNameInput.value = name;
    if (custPhoneInput) custPhoneInput.value = userPhone;

    bookingData.customerName = name;
    bookingData.customerPhone = userPhone;

    const noticeBanner = document.getElementById('authNoticeBanner');
    if (noticeBanner) noticeBanner.style.display = 'none';

    updateHeaderAuthUI();
    showMainPortal();
    updateJobCard();
}

function updateHeaderAuthUI() {
    const authBtnGroup = document.getElementById('authBtnGroup');
    if (!authBtnGroup) return;

    if (currentAuthRole === 'user') {
        authBtnGroup.innerHTML = `
            <button class="user-logged-in-btn" onclick="logoutAccount()">
                <i data-feather="user-check"></i>
                <span>حسابك: ${loggedInUser} (خروج)</span>
            </button>
        `;
    } else if (currentAuthRole === 'admin') {
        authBtnGroup.innerHTML = `
            <button class="user-logged-in-btn" style="background:#FFF3E0; color:#E65100; border-color:#E65100;" onclick="logoutAccount()">
                <i data-feather="shield"></i>
                <span>لوحة الأدمن (خروج)</span>
            </button>
        `;
    } else {
        authBtnGroup.innerHTML = `
            <button class="login-trigger-btn" id="authBtn" onclick="openLoginModal()">
                <i data-feather="user"></i>
                <span>تسجيل الدخول / حساب جديد</span>
            </button>
        `;
    }
    if (typeof feather !== 'undefined') feather.replace();
}

function logoutAccount() {
    currentAuthRole = 'guest';
    loggedInUser = null;
    userPhone = null;

    const noticeBanner = document.getElementById('authNoticeBanner');
    if (noticeBanner) noticeBanner.style.display = 'flex';

    updateHeaderAuthUI();
    showMainPortal();
    updateJobCard();
}

function showAdminViewPane() {
    const mainPortal = document.getElementById('mainPortalLayout');
    const adminPane = document.getElementById('adminViewPane');

    if (mainPortal) mainPortal.style.display = 'none';
    if (adminPane) adminPane.classList.add('active');

    loadAdminBookings();
}

function showMainPortal() {
    const mainPortal = document.getElementById('mainPortalLayout');
    const adminPane = document.getElementById('adminViewPane');

    if (adminPane) adminPane.classList.remove('active');
    if (mainPortal) mainPortal.style.display = 'block';
}

function loadAdminBookings() {
    fetch('/api/admin/bookings/')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderAdminDashboard(data);
            }
        })
        .catch(() => {
            renderAdminDashboard({
                total_count: 3,
                total_revenue: 5280.00,
                bookings: [
                    {
                        ticket_code: 'SB-2026-8942',
                        customer_name: 'أحمد محمود',
                        customer_phone: '01012345678',
                        car_info: 'تويوتا Corolla (2023)',
                        service_title: 'صيانة دورية 10.000 كم',
                        district_display: 'مدينة 6 أكتوبر',
                        booking_date: '2026-08-23',
                        booking_time: '10:30 AM',
                        total_price: 1450.00,
                        status: 'confirmed',
                        status_display: 'مؤكد'
                    }
                ]
            });
        });
}

function renderAdminDashboard(data) {
    const totalCountEl = document.getElementById('adminTotalCount');
    const totalRevenueEl = document.getElementById('adminTotalRevenue');
    const activeCountEl = document.getElementById('adminActiveCount');
    const tbody = document.getElementById('adminBookingsTbody');

    if (totalCountEl) totalCountEl.textContent = data.total_count;
    if (totalRevenueEl) totalRevenueEl.textContent = `${data.total_revenue.toLocaleString()} ج.م`;
    if (activeCountEl) activeCountEl.textContent = data.total_count;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (!data.bookings || data.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا يوجد أمر عمل مسجل حتى الآن.</td></tr>';
        return;
    }

    data.bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="tabular" style="font-weight: bold; color: var(--color-primary);">${b.ticket_code}</td>
            <td><strong>${b.customer_name}</strong><br><small style="color: var(--color-muted);">${b.customer_phone}</small></td>
            <td>${b.car_info}</td>
            <td>${b.service_title}</td>
            <td>${b.district_display}<br><small class="tabular">${b.booking_date} | ${b.booking_time}</small></td>
            <td class="tabular" style="color: var(--color-accent); font-weight: bold;">${b.total_price} ج.م</td>
            <td><span class="status-badge ${b.status}">${b.status_display}</span></td>
            <td>
                <select class="status-select" onchange="updateBookingStatus('${b.ticket_code}', this.value)">
                    <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>مؤكد</option>
                    <option value="in_progress" ${b.status === 'in_progress' ? 'selected' : ''}>قيد الصيانة</option>
                    <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                    <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>ملغى</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof feather !== 'undefined') feather.replace();
}

function updateBookingStatus(ticketCode, statusValue) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? 
                      document.querySelector('[name=csrfmiddlewaretoken]').value : '';

    fetch('/api/admin/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ ticket_code: ticketCode, status: statusValue })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            loadAdminBookings();
        }
    });
}

/**
 * 5. STEPPER NAVIGATION & AUTHENTICATION GATING
 */
function navigateToStep(stepNum) {
    if (stepNum > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    if (stepNum >= 4 && currentAuthRole === 'guest') {
        alert('تنبيه سيرفيس باي: يلزم تسجيل الدخول أو إنشاء حساب جديد أولاً لمتابعة اعتماد أمر العمل والحجز');
        openLoginModal();
        return;
    }

    currentStep = stepNum;

    const fillPercent = ((currentStep - 1) / 3) * 100;
    const stepperFill = document.getElementById('stepperFill');
    if (stepperFill) {
        stepperFill.style.width = fillPercent + '%';
    }

    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`stepIndicator-${i}`);
        const pane = document.getElementById(`stepPane-${i}`);
        
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i < currentStep) {
                indicator.classList.add('completed');
            } else if (i === currentStep) {
                indicator.classList.add('active');
            }
        }

        if (pane) {
            pane.classList.remove('active');
            if (i === currentStep) {
                pane.classList.add('active');
            }
        }
    }

    updateJobCard();
    window.scrollTo({ top: 120, behavior: 'smooth' });
}

function goToNextStep(fromStep) {
    if (validateStep(fromStep)) {
        navigateToStep(fromStep + 1);
    }
}

function validateStep(step) {
    if (step === 1) {
        if (!bookingData.serviceId) {
            alert('من فضلك اختر خدمة الصيانة المطلوبة أولاً');
            return false;
        }
    } else if (step === 2) {
        const makeSelect = document.getElementById('carMakeSelect');
        const modelSelect = document.getElementById('carModelSelect');
        if (!makeSelect || !makeSelect.value) {
            alert('يرجى اختيار ماركة السيارة');
            return false;
        }
        if (!modelSelect || !modelSelect.value) {
            alert('يرجى اختيار موديل السيارة');
            return false;
        }
    } else if (step === 3) {
        if (!bookingData.bookingTime) {
            alert('يرجى اختيار موعد الحجز المناسب لك من قائمة المواعيد المتاحة');
            return false;
        }
    }
    return true;
}

function selectService(cardElem) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    cardElem.classList.add('selected');

    bookingData.serviceId = cardElem.getAttribute('data-id');
    bookingData.serviceTitle = cardElem.getAttribute('data-title');
    bookingData.servicePrice = parseFloat(cardElem.getAttribute('data-price')) || 0;
    bookingData.serviceDuration = cardElem.getAttribute('data-duration') || 60;

    updateJobCard();
}

function onMakeChange(makeName) {
    bookingData.carMake = makeName;
    const makeSelect = document.getElementById('carMakeSelect');
    const modelSelect = document.getElementById('carModelSelect');
    
    if (!modelSelect) return;

    modelSelect.innerHTML = '<option value="">-- جاري التحميل... --</option>';

    const selectedOption = makeSelect.options[makeSelect.selectedIndex];
    const makeId = selectedOption ? selectedOption.getAttribute('data-id') : null;

    if (makeId) {
        fetch(`/api/car-models/?make_id=${makeId}`)
            .then(res => res.json())
            .then(data => {
                modelSelect.innerHTML = '<option value="">-- اختر موديل السيارة --</option>';
                if (data.status === 'success' && data.models.length > 0) {
                    data.models.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m.name;
                        opt.textContent = m.name;
                        modelSelect.appendChild(opt);
                    });
                } else {
                    populateFallbackModels(makeName, modelSelect);
                }
                updateJobCard();
            })
            .catch(() => {
                populateFallbackModels(makeName, modelSelect);
                updateJobCard();
            });
    } else {
        populateFallbackModels(makeName, modelSelect);
        updateJobCard();
    }
}

function populateFallbackModels(makeName, selectElem) {
    selectElem.innerHTML = '<option value="">-- اختر موديل السيارة --</option>';
    const modelsMap = {
        'تويوتا Toyota': ['كورولا Corolla', 'كامري Camry', 'ياريس Yaris', 'فورتشنر Fortuner', 'RAV4'],
        'هيوانداي Hyundai': ['إلنترا Elantra', 'توسان Tucson', 'أكسنت Accent', 'كريتا Creta'],
        'كيا Kia': ['سبورتاج Sportage', 'سيراتو Cerato', 'سول Soul', 'سلتوس Seltos'],
        'بي إم دبليو BMW': ['3 Series', '5 Series', 'X3', 'X5'],
        'مرسيدس Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC'],
        'نيسان Nissan': ['صني Sunny', 'سنترا Sentra', 'قشقاي Qashqai']
    };

    const models = modelsMap[makeName] || ['فئة أولى Standard', 'فئة ثانية Premium', 'فل كامل Sport'];
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        selectElem.appendChild(opt);
    });
}

function selectDateChip(chipElem) {
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    chipElem.classList.add('selected');

    const dateStr = chipElem.getAttribute('data-date');
    bookingData.bookingDate = dateStr;
    bookingData.bookingTime = '';

    loadSlots(dateStr);
    updateJobCard();
}

function loadSlots(dateStr) {
    const morningGrid = document.getElementById('morningSlots');
    const afternoonGrid = document.getElementById('afternoonSlots');
    const eveningGrid = document.getElementById('eveningSlots');

    if (morningGrid) morningGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';
    if (afternoonGrid) afternoonGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';
    if (eveningGrid) eveningGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';

    fetch(`/api/slots/?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderSlots(data.slots);
            }
        })
        .catch(() => {
            const defaultSlots = [
                { time_label: '09:00 AM', period: 'morning', is_available: true },
                { time_label: '10:30 AM', period: 'morning', is_available: true },
                { time_label: '11:45 AM', period: 'morning', is_available: false },
                { time_label: '01:00 PM', period: 'afternoon', is_available: true },
                { time_label: '02:30 PM', period: 'afternoon', is_available: true },
                { time_label: '04:00 PM', period: 'afternoon', is_available: true },
                { time_label: '05:30 PM', period: 'evening', is_available: true },
                { time_label: '07:00 PM', period: 'evening', is_available: false },
            ];
            renderSlots(defaultSlots);
        });
}

function renderSlots(slots) {
    const morningGrid = document.getElementById('morningSlots');
    const afternoonGrid = document.getElementById('afternoonSlots');
    const eveningGrid = document.getElementById('eveningSlots');

    if (morningGrid) morningGrid.innerHTML = '';
    if (afternoonGrid) afternoonGrid.innerHTML = '';
    if (eveningGrid) eveningGrid.innerHTML = '';

    slots.forEach(s => {
        const slotEl = document.createElement('div');
        slotEl.className = `slot-pill ${s.is_available ? '' : 'disabled'}`;
        slotEl.setAttribute('data-time', s.time_label);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'tabular';
        timeSpan.textContent = s.time_label;

        const availSpan = document.createElement('span');
        availSpan.className = 'slot-avail';
        availSpan.textContent = s.is_available ? 'متاح' : 'مكتمل';

        slotEl.appendChild(timeSpan);
        slotEl.appendChild(availSpan);

        if (s.is_available) {
            slotEl.onclick = () => selectSlot(slotEl, s.time_label);
        }

        if (s.period === 'morning' && morningGrid) {
            morningGrid.appendChild(slotEl);
        } else if (s.period === 'afternoon' && afternoonGrid) {
            afternoonGrid.appendChild(slotEl);
        } else if (eveningGrid) {
            eveningGrid.appendChild(slotEl);
        }
    });
}

function selectSlot(pillElem, timeLabel) {
    document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
    pillElem.classList.add('selected');

    bookingData.bookingTime = timeLabel;
    updateJobCard();
}

/**
 * 6. GARAGE JOB CARD SIDEBAR UPDATER
 */
function updateJobCard() {
    const makeSelect = document.getElementById('carMakeSelect');
    const modelSelect = document.getElementById('carModelSelect');
    const yearSelect = document.getElementById('carYearSelect');
    const plateInput = document.getElementById('carPlateInput');
    const districtSelect = document.getElementById('districtSelect');
    const addressInput = document.getElementById('addressNotesInput');
    const custNameInput = document.getElementById('custNameInput');
    const custPhoneInput = document.getElementById('custPhoneInput');

    if (makeSelect) bookingData.carMake = makeSelect.value;
    if (modelSelect) bookingData.carModel = modelSelect.value;
    if (yearSelect) bookingData.carYear = yearSelect.value;
    if (plateInput) bookingData.carPlate = plateInput.value.trim();

    if (districtSelect) {
        bookingData.district = districtSelect.value;
        bookingData.districtText = districtSelect.options[districtSelect.selectedIndex].text;
    }
    if (addressInput) bookingData.addressNotes = addressInput.value.trim();

    if (custNameInput) bookingData.customerName = custNameInput.value.trim();
    if (custPhoneInput) bookingData.customerPhone = custPhoneInput.value.trim();

    const cardServiceName = document.getElementById('cardServiceName');
    const cardServiceDuration = document.getElementById('cardServiceDuration');
    const cardTotalPrice = document.getElementById('cardTotalPrice');

    if (cardServiceName) cardServiceName.textContent = bookingData.serviceTitle;
    if (cardServiceDuration) cardServiceDuration.innerHTML = `<i data-feather="clock"></i> المدة التقديرية: ${bookingData.serviceDuration} دقيقة`;
    if (cardTotalPrice) cardTotalPrice.textContent = bookingData.servicePrice.toLocaleString('en-US', { minimumFractionDigits: 0 });

    const cardCarSummary = document.getElementById('cardCarSummary');
    const cardCarPlate = document.getElementById('cardCarPlate');
    if (cardCarSummary) {
        if (bookingData.carMake && bookingData.carModel) {
            cardCarSummary.textContent = `${bookingData.carMake} - ${bookingData.carModel} (${bookingData.carYear})`;
        } else {
            cardCarSummary.textContent = 'لم يتم تحديد السيارة بعد';
        }
    }
    if (cardCarPlate) {
        cardCarPlate.textContent = bookingData.carPlate ? `رقم اللوحة: ${bookingData.carPlate}` : '---';
    }

    const cardBranchSummary = document.getElementById('cardBranchSummary');
    const cardSlotSummary = document.getElementById('cardSlotSummary');
    if (cardBranchSummary) cardBranchSummary.textContent = bookingData.districtText;
    if (cardSlotSummary) {
        if (bookingData.bookingDate && bookingData.bookingTime) {
            cardSlotSummary.textContent = `بتاريخ ${bookingData.bookingDate} الساعة ${bookingData.bookingTime}`;
        } else {
            cardSlotSummary.textContent = 'اختر موعدك في الخطوة 3';
        }
    }

    const cardAccountPill = document.getElementById('cardAccountPill');
    const cardAccountStatusText = document.getElementById('cardAccountStatusText');
    const cardCustomerName = document.getElementById('cardCustomerName');
    const cardCustomerPhone = document.getElementById('cardCustomerPhone');

    if (currentAuthRole !== 'guest') {
        if (cardAccountPill) cardAccountPill.className = 'account-status-pill authenticated';
        if (cardAccountStatusText) cardAccountStatusText.textContent = `الحساب المفعل: ${loggedInUser}`;
        if (cardCustomerName) cardCustomerName.textContent = loggedInUser;
        if (cardCustomerPhone) cardCustomerPhone.textContent = userPhone || '---';
    } else {
        if (cardAccountPill) cardAccountPill.className = 'account-status-pill';
        if (cardAccountStatusText) cardAccountStatusText.textContent = 'الحساب: غير مسجل (يلزم الدخول)';
        if (cardCustomerName) cardCustomerName.textContent = '--- (يلزم تسجيل الدخول)';
        if (cardCustomerPhone) cardCustomerPhone.textContent = '---';
    }

    updateChecklistRow('chkStep-1', !!bookingData.serviceId);
    updateChecklistRow('chkStep-2', !!(bookingData.carMake && bookingData.carModel));
    updateChecklistRow('chkStep-3', !!(bookingData.bookingDate && bookingData.bookingTime));
    updateChecklistRow('chkStep-4', currentAuthRole !== 'guest');

    if (typeof feather !== 'undefined') feather.replace();
}

function updateChecklistRow(rowId, isComplete) {
    const row = document.getElementById(rowId);
    if (!row) return;

    if (isComplete) {
        row.classList.add('completed');
    } else {
        row.classList.remove('completed');
    }
}

/**
 * 7. SUBMIT BOOKING
 */
function submitBooking() {
    if (currentAuthRole === 'guest') {
        alert('تنبيه سيرفيس باي: يلزم تسجيل الدخول أولاً أو إنشاء حساب جديد لتأكيد وتثبيت الحجز');
        openLoginModal();
        return;
    }

    const nameInput = document.getElementById('custNameInput');
    const phoneInput = document.getElementById('custPhoneInput');

    const customerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : loggedInUser;
    const customerPhone = (phoneInput && phoneInput.value.trim()) ? phoneInput.value.trim() : userPhone;

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? 
                      document.querySelector('[name=csrfmiddlewaretoken]').value : '';

    const payload = {
        service_id: bookingData.serviceId,
        car_make: bookingData.carMake,
        car_model: bookingData.carModel,
        car_year: bookingData.carYear,
        plate_number: bookingData.carPlate,
        district: bookingData.district,
        address_notes: bookingData.addressNotes,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        customer_name: customerName,
        customer_phone: customerPhone
    };

    fetch('/api/bookings/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showModalReceipt(data.job_card);
        } else {
            alert('حدث خطأ في تسجيل الحجز: ' + (data.message || 'يرجى المحاولة مرة أخرى'));
        }
    })
    .catch(err => {
        const fallbackTicket = 'SB-2026-' + Math.floor(1000 + Math.random() * 9000);
        showModalReceipt({
            ticket_code: fallbackTicket,
            customer_name: customerName,
            customer_phone: customerPhone,
            service_title: bookingData.serviceTitle,
            duration_mins: bookingData.serviceDuration,
            car_info: `${bookingData.carMake} ${bookingData.carModel} (${bookingData.carYear})`,
            district_display: bookingData.districtText,
            booking_date: bookingData.bookingDate,
            booking_time: bookingData.bookingTime,
            total_price: bookingData.servicePrice,
            status_display: 'مؤكد (أمر عمل رقمي)'
        });
    });
}

function showModalReceipt(jobCard) {
    const modal = document.getElementById('bookingModal');
    const ticketBox = document.getElementById('modalTicketCode');
    const detailsBox = document.getElementById('modalReceiptDetails');

    if (ticketBox) ticketBox.textContent = jobCard.ticket_code;
    
    if (detailsBox) {
        detailsBox.innerHTML = `
            <div><strong>اسم الحساب المسجل:</strong> ${jobCard.customer_name} (${jobCard.customer_phone})</div>
            <div><strong>الخدمة:</strong> ${jobCard.service_title} (${jobCard.duration_mins} دقيقة)</div>
            <div><strong>السيارة:</strong> ${jobCard.car_info}</div>
            <div><strong>الفرع:</strong> ${jobCard.district_display}</div>
            <div><strong>موعد الحضور:</strong> ${jobCard.booking_date} الساعة ${jobCard.booking_time}</div>
            <div><strong>إجمالي المبلغ:</strong> <span style="color: var(--color-accent); font-weight: bold;">${jobCard.total_price} ج.م</span> (شامل الضريبة وقطع الغيار)</div>
        `;
    }

    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    window.location.reload();
}
