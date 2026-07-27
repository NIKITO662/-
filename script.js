const USER_API_URL = 'https://www.pekora.zip/internal/collectibles?userId=31241';
const inventoryGrid = document.getElementById('inventory-grid');
const totalRapDisplay = document.getElementById('total-rap');

let offerItems = [];
let requestItems = [];

async function fetchInventory() {
    try {
        // Използваме AllOrigins прокси, за да избегнем CORS защитата
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(USER_API_URL)}`;
        const response = await fetch(proxyUrl);
        const htmlText = await response.text();
        
        // Превръщаме върнатия текст в реален HTML документ
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Намираме всички "картички" с предмети
        const itemCards = doc.querySelectorAll('.card.bg-dark');
        
        let totalRap = 0;
        inventoryGrid.innerHTML = '';

        itemCards.forEach(card => {
            const body = card.querySelector('.card-body');
            const paragraphs = body.querySelectorAll('p');
            
            // Взимаме линка за картинката
            const imgEl = card.querySelector('img');
            const imgSrc = imgEl ? imgEl.src : '';

            if (paragraphs.length >= 2) {
                const itemName = paragraphs[0].innerText;
                
                // Взимаме текста на RAP, махаме "RAP: " и запетаите, и го превръщаме в число
                const rapText = paragraphs[1].innerText.replace('RAP: ', '').replace(/,/g, '').trim();
                const itemRap = parseInt(rapText, 10) || 0;
                
                totalRap += itemRap;
                
                // Създаваме обект с данните за калкулатора
                const itemObj = { name: itemName, rap: itemRap, assetThumbnailUrl: imgSrc };

                // Генерираме визуализацията в нашия сайт
                const myCard = document.createElement('div');
                myCard.className = 'item-card';
                myCard.innerHTML = `
                    <img src="${imgSrc}" alt="${itemName}">
                    <div class="item-name" title="${itemName}">${itemName}</div>
                    <div class="item-rap">RAP: ${itemRap.toLocaleString()}</div>
                `;
                
                // Добавяме събитие при клик за прехвърляне в калкулатора
                myCard.addEventListener('click', () => {
                    addToOffer(itemObj);
                });
                
                inventoryGrid.appendChild(myCard);
            }
        });

        // Показваме общия изчислен RAP
        totalRapDisplay.innerText = `Total RAP: ${totalRap.toLocaleString()}`;

    } catch (error) {
        console.error("Грешка при зареждане на инвентара:", error);
        totalRapDisplay.innerText = "Total RAP: Error loading data";
    }
}

// Функции за калкулатора
function addToOffer(item) {
    offerItems.push(item);
    updateCalculatorUI();
}

function updateCalculatorUI() {
    const offerSlots = document.getElementById('offer-slots');
    const offerRapDisplay = document.getElementById('offer-rap');
    
    offerSlots.innerHTML = '';
    let offerRap = 0;

    offerItems.forEach((item, index) => {
        // Тук вече използваме item.rap вместо recentAveragePrice
        offerRap += item.rap || 0;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-card';
        itemDiv.style.width = '80px';
        itemDiv.innerHTML = `<img src="${item.assetThumbnailUrl || ''}" style="width:50px; height:50px;"><br><span style="font-size:10px;">${item.rap}</span>`;
        
        // Премахване от калкулатора при клик
        itemDiv.addEventListener('click', () => {
            offerItems.splice(index, 1);
            updateCalculatorUI();
        });
        
        offerSlots.appendChild(itemDiv);
    });

    offerRapDisplay.innerText = offerRap.toLocaleString();
}

// Зареждане на данните при отваряне
fetchInventory();