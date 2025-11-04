document.addEventListener('DOMContentLoaded', () => {
    // --- 데이터 --- //
    const menuData = {
        burger: [
            { name: "리아 불고기버거", single: 4800, set: 7100, desc: "달콤짭짤한 불고기 소스" },
            { name: "데리버거", single: 3500, set: 5900, desc: "데리야끼 소스 버거" },
            { name: "새우버거", single: 4800, set: 7100, desc: "새우살 가득한 패티" },
            { name: "핫크리스피 치킨버거", single: 6000, set: 8100, desc: "매콤하고 바삭한 치킨패티" },
            { name: "클래식 치즈버거", single: 5300, set: 7500, desc: "기본 치즈버거" },
            { name: "더블 클래식 치즈버거", single: 7000, set: 9000, desc: "패티 2장 더블" },
            { name: "한우 불고기버거", single: 8600, set: 10500, desc: "한우 패티" },
            { name: "전주 비빔라이스버거", single: 6900, set: 8800, desc: "라이스번+매콤 소스" }
        ],
        dessertChicken: [
            { name: "포테이토", singlePrice: 3700, setUpcharge: 0 },
            { name: "양념감자", singlePrice: 4300, setUpcharge: 600 },
            { name: "포테이토(L)", singlePrice: 4000, setUpcharge: 500 },
            { name: "치즈스틱", singlePrice: 4400, setUpcharge: 700 },
            { name: "통오징어링", singlePrice: 1500, setUpcharge: 1500 },
            { name: "지파이 오리지널", singlePrice: 1500, setUpcharge: 1500 },
            { name: "못난이 치즈감자", singlePrice: 1500, setUpcharge: 1500 },
            { name: "코울슬로", singlePrice: 1200, setUpcharge: 0 },
            { name: "롱치즈스틱", singlePrice: 1200, setUpcharge: 400 },
            { name: "치킨너겟", singlePrice: 1200, setUpcharge: 1100 },
            { name: "토네이도 망고젤리", singlePrice: 3600, setUpcharge: 1400 },
            { name: "토네이도 초코쿠키", singlePrice: 3600, setUpcharge: 1400 }
        ],
        drinkCoffee: [
            { name: "펩시콜라(R)", singlePrice: 3200, setUpcharge: 0 },
            { name: "칠성사이다(R)", singlePrice: 3200, setUpcharge: 0 },
            { name: "펩시제로(R)", singlePrice: 3200, setUpcharge: 0 },
            { name: "펩시콜라(L)", singlePrice: 3600, setUpcharge: 200 },
            { name: "칠성사이다(L)", singlePrice: 3600, setUpcharge: 200 },
            { name: "펩시제로(L)", singlePrice: 3600, setUpcharge: 200 },
            { name: "아메리카노", singlePrice: 4000, setUpcharge: 500 },
            { name: "아이스아메리카노(R)", singlePrice: 4200, setUpcharge: 500 },
            { name: "아이스아메리카노(L)", singlePrice: 4800, setUpcharge: 1000 },
            { name: "아이스티(R)", singlePrice: 3200, setUpcharge: 300 },
            { name: "아이스티(L)", singlePrice: 3600, setUpcharge: 600 },
            { name: "레몬에이드(R)", singlePrice: 4500, setUpcharge: 700 },
            { name: "레몬에이드(L)", singlePrice: 5000, setUpcharge: 900 },
            { name: "카페라떼(핫)", singlePrice: 4500, setUpcharge: 1200 },
            { name: "카페라떼(아이스)", singlePrice: 4700, setUpcharge: 1200 }
        ]
    };

    const categoryMap = {
        burger: "버거",
        dessertChicken: "디저트·치킨",
        drinkCoffee: "음료·커피"
    };

    // --- 상태 관리 --- //
    const state = {
        currentScreen: "screen-welcome",
        orderType: null, // 'takeout' or 'dine-in'
        order: {
            items: [],
            totalPrice: 0
        },
        orderIdCounter: 0,
        selectingItem: null,
        selectingOptions: {
            isSet: false,
            sideOrDessert: null,
            drink: null,
            bun: "기본",
            bunPrice: 0,
            seasoning: null,
        }
    };

    // --- DOM 요소 --- //
    const screens = document.querySelectorAll(".screen");
    const progressBarSteps = document.querySelectorAll(".progress-bar .step");
    const categoryNav = document.querySelector(".category-nav ul");
    const itemsGrid = document.querySelector(".items-grid");
    const optionsScreen = document.getElementById("screen-options");
    const confirmScreen = document.getElementById("screen-confirm");
    const cartContainer = document.querySelector(".main-footer");

    // --- 공통 함수 --- //
    function updateProgressBar(currentScreen) {
        const screenStepMap = {
            "screen-welcome": -1,
            "screen-menu": 1,
            "screen-options": 1,
            "screen-confirm": 2,
            "screen-payment": 3,
            "screen-complete": 4
        };
        const currentStepIndex =
            screenStepMap[currentScreen] !== undefined ? screenStepMap[currentScreen] : 1;
        progressBarSteps.forEach((step, index) => {
            step.classList.toggle("active", index <= currentStepIndex);
        });
    }

    function showScreen(screenId) {
        state.currentScreen = screenId;
        screens.forEach(screen =>
            screen.classList.toggle("active", screen.id === screenId)
        );
        updateProgressBar(screenId);

        if (screenId === "screen-complete") {
            state.orderNumber = Math.floor(Math.random() * 900) + 100; // 100~999
            document.getElementById(
                "order-number-display"
            ).innerHTML = `<h2>주문번호: ${state.orderNumber}</h2>`;
            setTimeout(resetAndGoHome, 5000);
        }
    }

    function resetAndGoHome() {
        state.order = { items: [], totalPrice: 0 };
        state.orderIdCounter = 0;
        state.selectingItem = null;
        state.selectingOptions = {
            isSet: false,
            sideOrDessert: null,
            drink: null,
            bun: "기본",
            bunPrice: 0,
            seasoning: null,
        };
        renderCart();
        showScreen("screen-welcome");
    }

    // --- 메뉴 화면 렌더 --- //
    function renderCategories() {
        categoryNav.innerHTML = "";
        Object.keys(menuData).forEach((key, index) => {
            const button = document.createElement("button");
            button.textContent = categoryMap[key];
            button.classList.toggle("active", index === 0);
            button.onclick = () => {
                document
                    .querySelectorAll(".category-nav button")
                    .forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                renderItems(key);
            };
            const li = document.createElement("li");
            li.appendChild(button);
            categoryNav.appendChild(li);
        });
    }

    function renderItems(categoryKey) {
        itemsGrid.innerHTML = "";
        const items = menuData[categoryKey];
        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card";
            const price =
                item.single !== undefined ? item.single : item.singlePrice;
            card.innerHTML = `
                <img src="https://via.placeholder.com/150x100.png?text=${item.name}" alt="${item.name}">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${price.toLocaleString()}원</div>
            `;
            card.onclick = () => selectItem(item, categoryKey);
            itemsGrid.appendChild(card);
        });
    }

    function selectItem(item, categoryKey) {
        state.selectingItem = { ...item, type: categoryKey };
        state.selectingOptions = {
            isSet: false,
            sideOrDessert: null,
            drink: null,
            bun: "기본",
            bunPrice: 0,
            seasoning: null,
        };

        if (categoryKey === 'burger') {
            renderBurgerOptions();
            showScreen('screen-options');
        } else if (categoryKey === 'dessertChicken' && item.name === '양념감자') {
            // 디저트 양념감자 시즈닝 선택 화면
            renderDessertSeasoningOptions();
            showScreen('screen-options');
        } else {
            addToCart();
        }
    }

    // --- 버거 옵션 화면 --- //
    function renderBurgerOptions() {
        const item = state.selectingItem;
    
        if (!state.selectingOptions.bun) {
            state.selectingOptions.bun = '기본';
            state.selectingOptions.bunPrice = 0;
        }
        if (!state.selectingOptions.isSet) {
            state.selectingOptions.sideOrDessert = null;
            state.selectingOptions.drink = null;
        }
    
        // --- 빵 업그레이드 --- //
        const bunHtml = `
            <div class="option-group">
                <h3>빵 업그레이드 (필수 선택)</h3>
                <div class="choices">
                    <button class="choice-btn ${state.selectingOptions.bun === '기본' ? 'selected' : ''}" onclick="selectBun('기본', 0)">
                        <span>변경안함</span>
                        <span>+0원</span>
                    </button>
                    <button class="choice-btn ${state.selectingOptions.bun === '버터번' ? 'selected' : ''}" onclick="selectBun('버터번', 500)">
                        <span>버터번</span>
                        <span>+500원</span>
                    </button>
                </div>
            </div>
        `;
    
        // --- 세트 선택 --- //
        const setDiff = item.set - item.single;
        const setHtml = `
            <div class="option-group">
                <h3>세트 선택 (필수 선택)</h3>
                <div class="choices">
                    <button class="choice-btn ${!state.selectingOptions.isSet ? 'selected' : ''}" onclick="selectSet(false)">
                        <span>단품</span>
                        <span>+0원</span>
                    </button>
                    <button class="choice-btn ${state.selectingOptions.isSet ? 'selected' : ''}" onclick="selectSet(true)">
                        <span>세트</span>
                        <span>+${setDiff.toLocaleString()}원</span>
                    </button>
                </div>
            </div>
        `;
    
        // --- 세트일 때 디저트/음료 --- //
        let dessertHtml = '';
        if (state.selectingOptions.isSet) {
            dessertHtml += `<div class="option-group"><h3>디저트·치킨 선택</h3><div class="choices">`;
            menuData.dessertChicken.forEach(d => {
                const isSelected = state.selectingOptions.sideOrDessert?.name === d.name;
                dessertHtml += `
                    <button class="choice-btn ${isSelected ? 'selected' : ''}" onclick="selectSideOrDrink('sideOrDessert', '${d.name}')">
                        <span>${d.name}</span>
                        <span>+${d.setUpcharge.toLocaleString()}원</span>
                    </button>`;
            });
            dessertHtml += `</div></div>`;
    
            dessertHtml += `<div class="option-group"><h3>음료·커피 선택</h3><div class="choices">`;
            menuData.drinkCoffee.forEach(d => {
                const isSelected = state.selectingOptions.drink?.name === d.name;
                dessertHtml += `
                    <button class="choice-btn ${isSelected ? 'selected' : ''}" onclick="selectSideOrDrink('drink', '${d.name}')">
                        <span>${d.name}</span>
                        <span>+${d.setUpcharge.toLocaleString()}원</span>
                    </button>`;
            });
            dessertHtml += `</div></div>`;
        }
    
        // --- 양념감자 선택 시 시즈닝 옵션 --- //
        let seasoningHtml = '';
        if (
            state.selectingOptions.isSet &&
            state.selectingOptions.sideOrDessert &&
            state.selectingOptions.sideOrDessert.name === '양념감자'
        ) {
            if (!state.selectingOptions.seasoning) {
                state.selectingOptions.seasoning = '어니언';
            }
            const options = ['어니언', '치즈', '칠리'];
            seasoningHtml += `<div class="option-group"><h3>시즈닝 선택</h3><div class="choices">`;
            options.forEach(s => {
                const selected = state.selectingOptions.seasoning === s ? 'selected' : '';
                seasoningHtml += `
                    <button class="choice-btn ${selected}" onclick="selectSeasoning('${s}')">
                        <span>${s}</span>
                        <span>+0원</span>
                    </button>`;
            });
            seasoningHtml += `</div></div>`;
        }
    
        optionsScreen.innerHTML = `
            <header class="main-header"><h2>${item.name}</h2></header>
            <main class="options-main">
                ${bunHtml}
                ${setHtml}
                ${dessertHtml}
                ${seasoningHtml}
            </main>
            <footer class="options-footer">
                <button class="btn-cancel">취소</button>
                <button class="btn-add-cart">주문 담기</button>
            </footer>
        `;
    
        optionsScreen.querySelector('.btn-cancel').onclick = () => showScreen('screen-menu');
        optionsScreen.querySelector('.btn-add-cart').onclick = () => addToCart();
    }

    // --- 옵션 선택 함수들 (전역으로 노출) --- //
    window.selectSet = isSet => {
        state.selectingOptions.isSet = isSet;
        if (isSet) {
            if (!state.selectingOptions.sideOrDessert) {
                state.selectingOptions.sideOrDessert = menuData.dessertChicken[0];
            }
            if (!state.selectingOptions.drink) {
                state.selectingOptions.drink = menuData.drinkCoffee[0];
            }
        } else {
            state.selectingOptions.sideOrDessert = null;
            state.selectingOptions.drink = null;
        }
        renderBurgerOptions();
    };

    window.selectSideOrDrink = (type, name) => {
        const categoryKey =
            type === "sideOrDessert" ? "dessertChicken" : "drinkCoffee";
        state.selectingOptions[type] = menuData[categoryKey].find(
            i => i.name === name
        );
        renderBurgerOptions();
    };

    window.selectSeasoning = (type) => {
        state.selectingOptions.seasoning = type;
        if (!state.selectingItem) return;
    
        if (state.selectingItem.type === 'burger') {
            renderBurgerOptions();
        } else if (state.selectingItem.type === 'dessertChicken') {
            renderDessertSeasoningOptions();
        }
    };

    // 빵 선택 함수 (옵션 화면에서 사용)
    window.selectBun = (bunType, bunPrice) => {
        state.selectingOptions.bun = bunType;
        state.selectingOptions.bunPrice = bunPrice;
        renderBurgerOptions();
    };

    function renderDessertSeasoningOptions() {
        const item = state.selectingItem;
        if (!state.selectingOptions.seasoning) {
            state.selectingOptions.seasoning = '어니언';
        }
        const options = ['어니언', '치즈', '칠리'];
        let seasoningHtml = `<div class="option-group"><h3>시즈닝 선택</h3><div class="choices">`;
        options.forEach(s => {
            const selected = state.selectingOptions.seasoning === s ? 'selected' : '';
            seasoningHtml += `
                <button class="choice-btn ${selected}" onclick="selectSeasoning('${s}')">
                    <span>${s}</span>
                    <span>+0원</span>
                </button>`;
        });
        seasoningHtml += `</div></div>`;
    
        optionsScreen.innerHTML = `
            <header class="main-header"><h2>${item.name}</h2></header>
            <main class="options-main">
                ${seasoningHtml}
            </main>
            <footer class="options-footer">
                <button class="btn-cancel">취소</button>
                <button class="btn-add-cart">주문 담기</button>
            </footer>
        `;
    
        optionsScreen.querySelector('.btn-cancel').onclick = () => showScreen('screen-menu');
        optionsScreen.querySelector('.btn-add-cart').onclick = () => addToCart();
    }

    
    // --- 장바구니 담기 --- //
    function addToCart() {
        const item = state.selectingItem;
        const options = state.selectingOptions;
    
        let finalPrice;
        let name = item.name;
    
        if (item.type === 'burger') {
            if (options.isSet) {
                if (!options.sideOrDessert || !options.drink) {
                    alert("디저트와 음료를 선택해주세요.");
                    return;
                }
                // 세트에서 양념감자면 시즈닝 필수
                if (options.sideOrDessert.name === '양념감자' && !options.seasoning) {
                    alert("양념감자 시즈닝을 선택해주세요.");
                    return;
                }
                finalPrice = item.set + options.sideOrDessert.setUpcharge + options.drink.setUpcharge;
                name += ' 세트';
            } else {
                finalPrice = item.single;
            }
            // 빵 업그레이드
            finalPrice += options.bunPrice || 0;
        } else {
            // 디저트/음료
            if (item.type === 'dessertChicken' && item.name === '양념감자' && !options.seasoning) {
                alert("양념감자 시즈닝을 선택해주세요.");
                return;
            }
            finalPrice = item.singlePrice;
        }

        const existingItem = state.order.items.find(cartItem => {
            if (item.type !== "burger") return cartItem.name === item.name;
            if (cartItem.originalItemName !== item.name) return false;
            if (cartItem.isSet !== options.isSet) return false;
            if (cartItem.bun !== options.bun) return false;
            if (!cartItem.isSet) return true;
            return (
                cartItem.sideOrDessert.name === options.sideOrDessert.name &&
                cartItem.drink.name === options.drink.name
            );
        });

        if (existingItem) {
            existingItem.qty++;
        } else {
            state.orderIdCounter++;
            const orderItem = {
                id: state.orderIdCounter,
                type: item.type,
                name: name,
                isSet: options.isSet,
                sideOrDessert: options.sideOrDessert,
                drink: options.drink,
                bun: options.bun,
                bunPrice: options.bunPrice || 0,
                seasoning: options.seasoning || null,
                qty: 1,
                basePrice:
                    item.type === "burger"
                        ? options.isSet
                            ? item.set
                            : item.single
                        : item.singlePrice,
                finalPrice: finalPrice,
                upchargeDessert: options.sideOrDessert?.setUpcharge || 0,
                upchargeDrink: options.drink?.setUpcharge || 0,
                originalItemName: item.name,
                originalCategory: item.type
            };
            state.order.items.push(orderItem);
        }

        renderCart();
        showScreen("screen-menu");
        state.selectingItem = null;
        state.selectingOptions = {
            isSet: false,
            sideOrDessert: null,
            drink: null,
            bun: "기본",
            bunPrice: 0,
            seasoning: null,
        };
    }

    // --- 장바구니 & 주문 확인 --- //
    function calculateTotal() {
        state.order.totalPrice = state.order.items.reduce(
            (total, item) => total + item.finalPrice * item.qty,
            0
        );
        return state.order.totalPrice;
    }

    function renderCart() {
        if (state.order.items.length === 0) {
            cartContainer.innerHTML = "<p>장바구니가 비어있습니다.</p>";
            return;
        }

        const total = calculateTotal();
        const totalQty = state.order.items.reduce(
            (acc, item) => acc + item.qty,
            0
        );

        let listHtml = "";
        state.order.items.forEach(cartItem => {
            let optionText = '';

            if (cartItem.type === 'burger') {
                const bunText = cartItem.bun ? `, 빵: ${cartItem.bun}` : '';
                let sideName = cartItem.sideOrDessert ? cartItem.sideOrDessert.name : '';
            
                if (
                    cartItem.isSet &&
                    cartItem.sideOrDessert &&
                    cartItem.sideOrDessert.name === '양념감자' &&
                    cartItem.seasoning
                ) {
                    sideName += `(${cartItem.seasoning})`;
                }
            
                if (cartItem.isSet) {
                    optionText = `세트 (${sideName}, ${cartItem.drink.name}${bunText})`;
                } else {
                    optionText = `단품 (${bunText ? bunText.slice(2) : '빵: 기본'})`;
                }
            } else if (cartItem.type === 'dessertChicken' && cartItem.seasoning) {
                optionText = `시즈닝: ${cartItem.seasoning}`;
            }

            listHtml += `
                <div class="cart-item-small">
                    <div class="cart-item-main">
                        <div class="item-name">${cartItem.name}</div>
                        ${optionText ? `<div class="item-options">${optionText}</div>` : ''}
                    </div>
                    <div class="cart-item-meta">
                        <div class="cart-item-controls">
                            <button onclick="changeQuantity(${cartItem.id}, -1)">-</button>
                            <span>${cartItem.qty}</span>
                            <button onclick="changeQuantity(${cartItem.id}, 1)">+</button>
                            <button class="cart-remove" onclick="removeFromCart(${cartItem.id})">×</button>
                        </div>
                        <div class="item-price">${(cartItem.finalPrice * cartItem.qty).toLocaleString()}원</div>
                    </div>
                </div>
            `;
        });

        cartContainer.innerHTML = `
            <div class="cart-list">
                ${listHtml}
            </div>
            <div class="cart-summary">
                <span>수량: ${totalQty}개</span>
                <span>총 금액: ${total.toLocaleString()}원</span>
            </div>
            <button class="btn-pay">주문하기</button>
        `;

        cartContainer.querySelector(".btn-pay").onclick = () => {
            renderConfirmScreen();
            showScreen("screen-confirm");
        };
    }

    window.changeQuantity = (cartId, delta) => {
        const cartItem = state.order.items.find(item => item.id === cartId);
        if (cartItem) {
            cartItem.qty += delta;
            if (cartItem.qty <= 0) {
                removeFromCart(cartId);
            } else {
                renderConfirmScreen();
                renderCart();
            }
        }
    };

    window.removeFromCart = cartId => {
        state.order.items = state.order.items.filter(item => item.id !== cartId);
        if (
            state.order.items.length === 0 &&
            state.currentScreen === "screen-confirm"
        ) {
            showScreen("screen-menu");
        } else {
            renderConfirmScreen();
        }
        renderCart();
    };

    function renderConfirmScreen() {
        confirmScreen.innerHTML = "";
        if (state.order.items.length === 0) {
            confirmScreen.innerHTML =
                "<h1>장바구니가 비었습니다.</h1><button onclick=\"showScreen('screen-menu')\">메뉴로 돌아가기</button>";
            return;
        }

        let listHtml = "";
        state.order.items.forEach(cartItem => {
            let optionText = '';

            if (cartItem.type === 'burger') {
                const bunText = cartItem.bun ? `, 빵: ${cartItem.bun}` : '';
                let sideName = cartItem.sideOrDessert ? cartItem.sideOrDessert.name : '';
            
                if (
                    cartItem.isSet &&
                    cartItem.sideOrDessert &&
                    cartItem.sideOrDessert.name === '양념감자' &&
                    cartItem.seasoning
                ) {
                    sideName += `(${cartItem.seasoning})`;
                }
            
                if (cartItem.isSet) {
                    optionText = `세트 (${sideName}, ${cartItem.drink.name}${bunText})`;
                } else {
                    optionText = `단품 (${bunText ? bunText.slice(2) : '빵: 기본'})`;
                }
            } else if (cartItem.type === 'dessertChicken' && cartItem.seasoning) {
                optionText = `시즈닝: ${cartItem.seasoning}`;
            }

            listHtml += `
                <div class="confirm-item">
                    <div class="item-info">
                        <p class="item-name">${cartItem.name}</p>
                        <p class="item-options">${optionText}</p>
                    </div>
                    <div class="item-controls">
                        <button onclick="changeQuantity(${cartItem.id}, -1)">-</button>
                        <span>${cartItem.qty}</span>
                        <button onclick="changeQuantity(${cartItem.id}, 1)">+</button>
                    </div>
                    <p class="item-price">${(
                        cartItem.finalPrice * cartItem.qty
                    ).toLocaleString()}원</p>
                    <button class="btn-remove" onclick="removeFromCart(${cartItem.id})">×</button>
                </div>
            `;
        });

        confirmScreen.innerHTML = `
            <header class="main-header"><h1>주문 내역을 확인해주세요</h1></header>
            <main class="confirm-main">${listHtml}</main>
            <footer class="confirm-footer">
                <div class="total-section">총 결제금액: ${calculateTotal().toLocaleString()}원</div>
                <div class="button-section">
                    <button id="btn-add-more">추가 주문</button>
                    <button id="btn-confirm-pay">결제하기</button>
                </div>
            </footer>
        `;

        confirmScreen.querySelector("#btn-add-more").onclick = () =>
            showScreen("screen-menu");
        confirmScreen.querySelector("#btn-confirm-pay").onclick = () => {
            document.querySelector(
                "#screen-payment .total-amount"
            ).textContent = `${calculateTotal().toLocaleString()}원`;
            showScreen("screen-payment");
        };
    }

    // --- 이벤트 리스너 --- //
    document.getElementById("btn-takeout").onclick = () => {
        state.orderType = "takeout";
        showScreen("screen-menu");
        renderCategories();
        renderItems("burger");
    };

    document.getElementById("btn-dine-in").onclick = () => {
        state.orderType = "dine-in";
        showScreen("screen-menu");
        renderCategories();
        renderItems("burger");
    };

    document.querySelectorAll(".btn-home").forEach(btn => {
        btn.onclick = resetAndGoHome;
    });

    const handlePayment = () => {
        const paymentMain = document.querySelector(
            "#screen-payment .payment-main"
        );
        const originalContent = paymentMain.innerHTML;
        paymentMain.innerHTML =
            '<h1 class="payment-processing">결제 진행 중...</h1>';
        setTimeout(() => {
            showScreen("screen-complete");
            paymentMain.innerHTML = originalContent;
        }, 2000);
    };

    document.getElementById("btn-pay-card").onclick = handlePayment;
    document.getElementById("btn-pay-cash").onclick = handlePayment;
    document.getElementById("btn-pay-other").onclick = handlePayment;
    document.getElementById("btn-pay-points").onclick = () => {
        alert("포인트 적립 기능은 현재 지원되지 않습니다.");
    };

    // --- 초기화 --- //
    renderCart();
    showScreen("screen-welcome");
});
