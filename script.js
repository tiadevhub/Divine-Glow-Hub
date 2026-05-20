function searchProduct(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let text = card.innerText.toLowerCase();

        if(text.includes(input)){
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}