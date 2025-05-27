(function(){
    const countdownEl = document.getElementById('countdown');
    const target = new Date(Date.now() + 7*24*60*60*1000);
    function updateCountdown(){
        const diff = target - new Date();
        if(diff <= 0){
            countdownEl.textContent = 'Hết thời gian khuyến mãi';
            return;
        }
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }
    setInterval(updateCountdown,1000);
    updateCountdown();

    const names = ['An', 'Bình', 'Lan', 'Huy', 'Tùng', 'Mai'];
    const products = ['Đồ chơi', 'Thức ăn', 'Phụ kiện'];
    function showOrder(){
        const name = names[Math.floor(Math.random()*names.length)];
        const product = products[Math.floor(Math.random()*products.length)];
        const div = document.createElement('div');
        div.className = 'order-toast';
        div.textContent = `${name} vừa đặt mua ${product}`;
        document.getElementById('order-notify').appendChild(div);
        setTimeout(()=>div.remove(),5000);
    }
    setInterval(showOrder,15000);
})();
