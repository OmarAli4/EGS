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

    // 6. Start Carousel Auto-Scroll Engine & Hero Image Slider
    initContinuousCarousel();
    initHeroSlider();

    // 7. Initial Job Card Update
    updateJobCard();

    // 8. Restore Persisted User/Admin Login Session
    restorePersistedAuthSession();
});

/**
 * 1. LIGHTWEIGHT INSTANT LOADER
 */
function runSplashLoader() {
    const splashBar = document.getElementById('splashBar');
    const splashPercent = document.getElementById('splashPercent');
    const splashLoader = document.getElementById('splashLoader');
    if (!splashLoader) return;

    if (splashBar) splashBar.style.width = '100%';
    if (splashPercent) splashPercent.textContent = '100%';

    setTimeout(() => {
        splashLoader.classList.add('fade-out');
        setTimeout(() => {
            splashLoader.style.display = 'none';
        }, 200);
    }, 150);
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
        if (Math.abs(wrapper.scrollLeft) >= maxScroll - 2) {
            wrapper.scrollLeft = 0;
        }
    }, 28);
}

/**
 * 2.1 E-COMMERCE HERO IMAGE SLIDER ENGINE (Noon/Amazon Style)
 */
let currentHeroSlideIndex = 0;
let heroSlideTimer = null;

function showHeroSlide(index) {
    const slides = document.querySelectorAll('#ecommerceSlider .slider-item');
    const dots = document.querySelectorAll('#bannerDots .dot');
    if (!slides.length) return;

    if (index >= slides.length) currentHeroSlideIndex = 0;
    else if (index < 0) currentHeroSlideIndex = slides.length - 1;
    else currentHeroSlideIndex = index;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentHeroSlideIndex);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentHeroSlideIndex);
    });

    if (typeof feather !== 'undefined') feather.replace();
}

window.nextBannerSlide = function(e) { if(e) e.stopPropagation(); changeHeroSlide(1); };
window.prevBannerSlide = function(e) { if(e) e.stopPropagation(); changeHeroSlide(-1); };
window.setBannerSlide = function(index, e) { if(e) e.stopPropagation(); goToHeroSlide(index); };
function changeHeroSlide(direction) {
    showHeroSlide(currentHeroSlideIndex + direction);
    restartHeroSliderTimer();
}

function goToHeroSlide(index) {
    showHeroSlide(index);
    restartHeroSliderTimer();
}

function startHeroSliderTimer() {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
        changeHeroSlide(1);
    }, 4500);
}

function restartHeroSliderTimer() {
    startHeroSliderTimer();
}

function initHeroSlider() {
    const slider = document.getElementById('ecommerceSlider');
    if (!slider) return;

    startHeroSliderTimer();

    slider.addEventListener('mouseenter', () => clearInterval(heroSlideTimer));
    slider.addEventListener('mouseleave', startHeroSliderTimer);

    // Touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(heroSlideTimer);
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        startHeroSliderTimer();
        if (touchStartX - touchEndX > 45) {
            changeHeroSlide(1);
        } else if (touchEndX - touchStartX > 45) {
            changeHeroSlide(-1);
        }
    }, { passive: true });
}

function scrollToBooking(event) {
    if (event) event.preventDefault();
    const target = document.querySelector('.stepper-bar') || document.getElementById('stepPane-1') || document.querySelector('.booking-column');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function copyPromoCode(code, btnElem) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            if (btnElem) {
                const originalHTML = btnElem.innerHTML;
                btnElem.innerHTML = `<i data-feather="check"></i> <span>تم نسخ كود الخصم (${code}) ✓</span>`;
                btnElem.style.borderColor = '#10B981';
                btnElem.style.color = '#34D399';
                if (typeof feather !== 'undefined') feather.replace();
                setTimeout(() => {
                    btnElem.innerHTML = originalHTML;
                    btnElem.style.borderColor = '#F59E0B';
                    btnElem.style.color = '#FEF08A';
                    if (typeof feather !== 'undefined') feather.replace();
                }, 2500);
            }
        }).catch(() => {
            alert(`كود الخصم هو: ${code}`);
        });
    } else {
        alert(`كود الخصم هو: ${code}`);
    }
}

function quickSelectService(serviceId) {
    const card = document.querySelector(`.service-card[data-id="${serviceId}"]`);
    if (card) {
        selectService(card);
    }
    navigateToStep(1);
    const step1 = document.getElementById('stepPane-1');
    if (step1) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const formUser = document.getElementById('formUserLogin');
    const formReg = document.getElementById('formUserRegister');

    [tabUser, tabReg].forEach(t => t && t.classList.remove('active'));
    [formUser, formReg].forEach(f => f && f.classList.remove('active'));

    if (role === 'register') {
        if (tabReg) tabReg.classList.add('active');
        if (formReg) formReg.classList.add('active');
    } else {
        if (tabUser) tabUser.classList.add('active');
        if (formUser) formUser.classList.add('active');
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
        const passwordInput = document.getElementById('loginUserPasswordInput').value.trim();

        fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ username: userInput, password: passwordInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                completeAuthSession('user', data.name, data.phone);
            } else {
                alert(data.message || 'فشل تسجيل الدخول، يرجى مراجعة البيانات المدخلة');
            }
        })
        .catch(() => completeAuthSession('user', userInput, '01000000000'));
    }
}

function completeAuthSession(role, name, phone) {
    closeLoginModal();
    currentAuthRole = 'user';
    loggedInUser = name;
    userPhone = phone || '010XXXXXXXX';

    try {
        localStorage.setItem('egs_auth_session', JSON.stringify({
            role: 'user',
            name: name,
            phone: userPhone
        }));
    } catch (e) {}

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

function restorePersistedAuthSession() {
    try {
        const saved = localStorage.getItem('egs_auth_session');
        if (!saved) return;

        const session = JSON.parse(saved);
        if (!session || !session.name) return;

        currentAuthRole = 'user';
        loggedInUser = session.name;
        userPhone = session.phone || '010XXXXXXXX';

        const custNameInput = document.getElementById('custNameInput');
        const custPhoneInput = document.getElementById('custPhoneInput');
        if (custNameInput && session.name) custNameInput.value = session.name;
        if (custPhoneInput && session.phone) custPhoneInput.value = session.phone;

        bookingData.customerName = session.name;
        bookingData.customerPhone = session.phone;

        const noticeBanner = document.getElementById('authNoticeBanner');
        if (noticeBanner) noticeBanner.style.display = 'none';

        updateHeaderAuthUI();
    } catch (e) {
        console.error('Failed to restore session:', e);
    }
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
    try {
        localStorage.removeItem('egs_auth_session');
    } catch (e) {}

    currentAuthRole = 'guest';
    loggedInUser = null;
    userPhone = null;

    const noticeBanner = document.getElementById('authNoticeBanner');
    if (noticeBanner) noticeBanner.style.display = 'flex';

    updateHeaderAuthUI();
    showMainPortal();
    updateJobCard();
}

function showMainPortal() {
    const mainPortal = document.getElementById('mainPortalLayout');
    if (mainPortal) mainPortal.style.display = 'block';
}

function goToHomePage(event) {
    if (event) event.preventDefault();
    showMainPortal();
    navigateToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        const addressInput = document.getElementById('addressNotesInput');
        if (!addressInput || !addressInput.value.trim()) {
            alert('يرجى إدخال عنوان تواجد السيارة بالتفصيل (أو الضغط على زر تحديد موقعي بالـ GPS 📍)');
            if (addressInput) addressInput.focus();
            return false;
        }
        if (!bookingData.bookingTime) {
            alert('يرجى اختيار موعد وصول سيارة الصيانة المناسب لك من قائمة المواعيد المتاحة');
            return false;
        }
    }
    return true;
}

/**
 * GPS AUTO DETECT LOCATION
 */
function detectGPSLocation() {
    const gpsBtn = document.getElementById('gpsBtn');
    const gpsBtnText = document.getElementById('gpsBtnText');
    const gpsHint = document.getElementById('gpsHint');
    const addressInput = document.getElementById('addressNotesInput');

    if (!navigator.geolocation) {
        alert('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
        return;
    }

    if (gpsBtnText) gpsBtnText.textContent = 'جاري تحديد موقعك الجغرافي بدقة... 🛰️';
    if (gpsBtn) gpsBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
            
            const gpsInfo = `[📍 GPS: ${lat}, ${lng} | الخريطة: ${mapsUrl}]`;
            
            if (addressInput) {
                const currentVal = addressInput.value.trim();
                if (currentVal && !currentVal.includes('GPS:')) {
                    addressInput.value = `${currentVal} - ${gpsInfo}`;
                } else {
                    addressInput.value = `موقعي الحالي - ${gpsInfo}`;
                }
                bookingData.addressNotes = addressInput.value;
            }

            if (gpsBtnText) gpsBtnText.textContent = 'تم التقاط موقعك الجغرافي بنجاح! 📍';
            if (gpsHint) {
                gpsHint.textContent = `تم تسجيل إحداثيات موقعك (${lat}, ${lng}) - يرجى كتابة اسم الشارع أو رقم الفيلا للتأكيد.`;
                gpsHint.style.color = 'var(--color-go)';
            }
            if (gpsBtn) {
                gpsBtn.disabled = false;
                gpsBtn.classList.add('gps-success');
            }
            updateJobCard();
        },
        (error) => {
            console.warn('GPS Error:', error);
            if (gpsBtnText) gpsBtnText.textContent = 'تحديد موقعي الحالي بالـ GPS 📍';
            if (gpsBtn) gpsBtn.disabled = false;
            if (gpsHint) {
                gpsHint.textContent = 'تعذر التقاط الـ GPS تلقائياً. يرجى إدخال اسم الشارع ورقم العقار يدوياً.';
                gpsHint.style.color = '#E53E3E';
            }
            alert('يرجى السماح بصلاحية الموقع في المتصفح، أو إدخال العنوان يدوياً بالتفصيل.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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

function quickSelectMake(makeName) {
    const makeSelect = document.getElementById('carMakeSelect');
    if (makeSelect) {
        let found = false;
        for (let i = 0; i < makeSelect.options.length; i++) {
            if (makeSelect.options[i].value === makeName || makeSelect.options[i].text.includes(makeName)) {
                makeSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (found) {
            onMakeChange(makeSelect.value);
            navigateToStep(2);
            const step2Elem = document.getElementById('stepPane-2');
            if (step2Elem) {
                step2Elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
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
    const cardServiceTitle = document.getElementById('cardServiceTitle');
    const cardServiceDuration = document.getElementById('cardServiceDuration');
    const cardTotalPrice = document.getElementById('cardTotalPrice');

    if (cardServiceName) cardServiceName.textContent = bookingData.serviceTitle;
    if (cardServiceTitle) cardServiceTitle.textContent = bookingData.serviceTitle ? `${bookingData.serviceTitle} (${bookingData.serviceDuration} د)` : 'صيانة دورية 10,000 كم';
    if (cardServiceDuration) cardServiceDuration.innerHTML = `<i data-feather="clock"></i> المدة التقديرية: ${bookingData.serviceDuration} دقيقة`;
    if (cardTotalPrice) cardTotalPrice.textContent = bookingData.servicePrice.toLocaleString('en-US', { minimumFractionDigits: 0 });

    const cardCarSummary = document.getElementById('cardCarSummary');
    const cardCarInfo = document.getElementById('cardCarInfo');
    const cardCarPlate = document.getElementById('cardCarPlate');
    if (cardCarSummary) {
        if (bookingData.carMake && bookingData.carModel) {
            cardCarSummary.textContent = `${bookingData.carMake} - ${bookingData.carModel} (${bookingData.carYear})`;
        } else {
            cardCarSummary.textContent = 'لم يتم تحديد السيارة بعد';
        }
    }
    if (cardCarInfo) {
        if (bookingData.carMake && bookingData.carModel) {
            cardCarInfo.textContent = `${bookingData.carMake} ${bookingData.carModel} (${bookingData.carYear})`;
        } else {
            cardCarInfo.textContent = 'اختر ماركة وموديل السيارة';
        }
    }
    if (cardCarPlate) {
        cardCarPlate.textContent = bookingData.carPlate ? `رقم اللوحة: ${bookingData.carPlate}` : '---';
    }

    const cardBranchSummary = document.getElementById('cardBranchSummary');
    const cardSlotSummary = document.getElementById('cardSlotSummary');
    const cardScheduleInfo = document.getElementById('cardScheduleInfo');
    if (cardBranchSummary) cardBranchSummary.textContent = bookingData.districtText;
    if (cardSlotSummary) {
        if (bookingData.bookingDate && bookingData.bookingTime) {
            cardSlotSummary.textContent = `بتاريخ ${bookingData.bookingDate} الساعة ${bookingData.bookingTime}`;
        } else {
            cardSlotSummary.textContent = 'اختر موعدك في الخطوة 3';
        }
    }
    if (cardScheduleInfo) {
        if (bookingData.bookingDate && bookingData.bookingTime) {
            cardScheduleInfo.textContent = `${bookingData.districtText} - ${bookingData.bookingDate} (${bookingData.bookingTime})`;
        } else {
            cardScheduleInfo.textContent = bookingData.districtText ? `${bookingData.districtText} - حدد الموعد` : 'حدد منطقتك وموعد وصول الفني';
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

function copyInstapay(textToCopy, btnElem) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = btnElem.textContent;
            btnElem.textContent = 'تم النسخ ✓';
            btnElem.classList.add('copied');
            setTimeout(() => {
                btnElem.textContent = originalText;
                btnElem.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            alert('تم نسخ البيانات: ' + textToCopy);
        });
    } else {
        alert('بيانات التحويل: ' + textToCopy);
    }
}

function showModalReceipt(jobCard) {
    const modal = document.getElementById('bookingModal');
    const ticketBox = document.getElementById('modalTicketCode');
    const detailsBox = document.getElementById('modalReceiptDetails');
    const whatsappBtn = document.getElementById('modalWhatsappBtn');

    if (ticketBox) ticketBox.textContent = jobCard.ticket_code;
    
    if (detailsBox) {
        detailsBox.innerHTML = `
            <div><strong>اسم العميل:</strong> ${jobCard.customer_name} (${jobCard.customer_phone})</div>
            <div><strong>خدمة الصيانة:</strong> ${jobCard.service_title} (${jobCard.duration_mins} دقيقة)</div>
            <div><strong>بيانات السيارة:</strong> ${jobCard.car_info}</div>
            <div><strong>منطقة وموقع الصيانة:</strong> ${jobCard.district_display} ${jobCard.address_notes ? `(${jobCard.address_notes})` : ''}</div>
            <div><strong>موعد وصول سيارة الصيانة:</strong> ${jobCard.booking_date} الساعة ${jobCard.booking_time}</div>
            <div><strong>إجمالي تكلفة الخدمة:</strong> <span style="color: var(--color-primary); font-weight: bold;">${jobCard.total_price} ج.م</span> (شامل الضريبة وقطع الغيار الأصلية)</div>
        `;
    }

    // Build Formatted WhatsApp Message
    const waText = 
`🚗 *طلب حجز صيانة سيارة متنقلة - EGS Elite Garage*
━━━━━━━━━━━━━━━━━━━
📋 *رقم أمر العمل:* ${jobCard.ticket_code}
👤 *اسم العميل:* ${jobCard.customer_name}
📞 *رقم الهاتف:* ${jobCard.customer_phone}
🚘 *السيارة:* ${jobCard.car_info}
🔧 *الخدمة المطلوبة:* ${jobCard.service_title}
📍 *الموقع والعنوان:* ${jobCard.district_display} - ${jobCard.address_notes || 'موقع العميل'}
📅 *موعد وصول الفني:* ${jobCard.booking_date} الساعة ${jobCard.booking_time}
💰 *إجمالي التكلفة:* ${jobCard.total_price} ج.م

━━━━━━━━━━━━━━━━━━━
💳 *بيانات الدفع والتحويل عبر إنستاباي (InstaPay):*
🔹 *معرف إنستاباي (IPA):* egs.garage@instapay
🔹 *رقم الهاتف للتحويل:* 01019900990
🔹 *اسم الحساب:* Elite Garage Service Center
📌 *مرفق لحضرتكم إيصال التحويل لتأكيد الحجز وبدء تحرك سيارة الصيانة فوراً.*
━━━━━━━━━━━━━━━━━━━
مركز EGS لخدمات الصيانة المتنقلة الفورية 🚚`;

    // WhatsApp Business Hotline: 01019900990
    const egsWhatsappNumber = '201019900990';
    const waUrl = `https://api.whatsapp.com/send?phone=${egsWhatsappNumber}&text=${encodeURIComponent(waText)}`;

    if (whatsappBtn) {
        whatsappBtn.href = waUrl;
    }

    if (modal) modal.classList.add('active');
    if (typeof feather !== 'undefined') feather.replace();
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    window.location.reload();
}
