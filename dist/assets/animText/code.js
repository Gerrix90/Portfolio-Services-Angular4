window.addEventListener('load',function(){
    var nodes = document.querySelectorAll('.opening');
    
    for(var i =0; i<nodes.length; i++){
        var words = nodes[i].innerText.split("");
        
        var html = "";

        for(var i2=0; i2<words.length; i2++){
            html += "<span>"+words[i2]+"</span>"
        }
        nodes[i].innerHTML = html;
    }
})