let cases;
let myGraph;

class Graph {
    constructor(pos, size, data) {
        this.pos = pos;
        this.size = size;
        this.data = data;
        
        this.doublingTime = 6;
        this.fatalatyRate = 0.01;
        this.infectionToDeath = 21;
        
        this.showEstimated = true;
        
        this.selectedCountry = "World";
        
        this.colors = {"deaths" : color("#eb4f5c"), "confirmed" : color("#002b5c"), "estimated" : color("#ffa600"), "recovered" : color("#5c7b00")};
        this.update();
    }
    
    update() {
        this.createProjectedCasesFromDeaths();
        
        background(221);
        this.show();
    }
    
    changeData(d) {
        this.data = d;
        this.update();
    }
    
    calculateMaxValue() {
        let maxV = 0;
        for(let d of this.data) {
            maxV = max(maxV, d["deaths"]);
            if(this.showEstimated) maxV = max(maxV, d["estimated"]);
            maxV = max(maxV, d["confirmed"]);
            maxV = max(maxV, d["recovered"]);
        }
        this.maxValue = maxV;
    }
    
    createProjectedCasesFromDeaths() {
        let multiplierSinceDayOfInfection = pow(2, this.infectionToDeath / this.doublingTime);
        for(let d of this.data) {
            d["estimated"] = d["deaths"] / this.fatalatyRate * multiplierSinceDayOfInfection;
        }
        this.calculateMaxValue()
    }
    
    showData(s, y) {
        fill(this.colors[s]);
        noStroke();
        textAlign(LEFT);
        text(s + ": " + nfc(floor(this.data[this.data.length - 1][s])), this.pos.x + 10, this.pos.y + 40 + y * 20);
        
        stroke(this.colors[s]);
        strokeWeight(2);
        noFill();
        beginShape();
        for(let i = 0; i < this.data.length; i++) {
            vertex(this.pos.x + i * (this.size.x / this.data.length), 
                   this.pos.y + this.size.y - this.data[i][s] / (this.maxValue * 1.1) * this.size.y);
        }
        endShape();
        strokeWeight(1);
    }
    
    show(){
        textSize(20);
        textStyle(BOLD);
        textAlign(CENTER);
        noStroke();
        fill(0);
        text(this.selectedCountry, width / 2, this.pos.y - 10);
        textSize(8);
        textStyle(NORMAL);
        
        let sk = 2;
        if(this.size.x / this.data.length < 10) sk = 4;
        textAlign(CENTER);
        for(let x = 0; x < this.data.length; x ++) {
            let ll = 3;
            fill(0);
            noStroke();
            if(x % sk == 0) { text(this.data[x]["date"].substring(5, 20),
                                 this.pos.x + x * (this.size.x / this.data.length), 
                                 this.pos.y + this.size.y + 15);
                             ll += 3;
                            }
            stroke(0);
            noFill();
            line(this.pos.x + x * (this.size.x / this.data.length), this.pos.y + this.size.y, 
                 this.pos.x + x * (this.size.x / this.data.length), this.pos.y + this.size.y + ll);
        }
        textStyle(BOLD);
        fill(0);
        noStroke();
        textAlign(RIGHT);
        text("date (m-dd)", this.pos.x + this.size.x, this.pos.y + this.size.y + 25);
        textStyle(NORMAL);
        
        for(let y = this.pos.y; y <= this.pos.y + this.size.y; y += this.size.y / 10) {
            stroke(0);
            noFill();
            line(this.pos.x, y, 
                 this.pos.x - 3, y);
            textAlign(RIGHT);
            fill(0);
            noStroke();
            let t = nfc(floor((y - this.pos.y) / this.size.y * this.maxValue * 1.1));
            if(y >= this.pos.y + this.size.y) {
                textStyle(BOLD);
                t = "# of cases"
            }
            text(t, this.pos.x - 5, 2 * this.pos.y + this.size.y - y);
        }
        textStyle(NORMAL);
        noFill();
        stroke(0);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        
        textSize(12);
        textAlign(LEFT);
        fill(0);
        noStroke();
        textStyle(BOLD);
        text("today", this.pos.x + 10, this.pos.y + 20);
        textStyle(NORMAL);
        
        this.showData("confirmed", 0);
        this.showData("deaths", 1);
        this.showData("recovered", 2);
        if(this.showEstimated) this.showData("estimated", 3);
        
        let i = floor((mouseX - this.pos.x) / (this.size.x / this.data.length));
        if(i < 0 || i >= this.data.length) return;
        
        let delta = -30;
        if(i > this.data.length / 4) {
            textAlign(RIGHT);
        } else {
            textAlign(LEFT);
            delta = 10;
        }
        noStroke();
        fill(0)
        textStyle(BOLD);
        text(this.data[i]["date"], mouseX + delta, mouseY + 10);
        textStyle(NORMAL);
        fill(this.colors["confirmed"]);
        text(nfc(this.data[i]["confirmed"]), mouseX + delta, mouseY + 30);
        
        fill(this.colors["deaths"]);
        text(nfc(this.data[i]["deaths"]), mouseX + delta, mouseY + 50);
        
        fill(this.colors["recovered"]);
        text(nfc(this.data[i]["recovered"]), mouseX + delta, mouseY + 70);
        
        fill(this.colors["estimated"]);
        if(this.showEstimated) text(nfc(floor(this.data[i]["estimated"])), mouseX + delta, mouseY + 90);
        
        stroke(181);
        let x = i * (this.size.x / this.data.length) + this.pos.x;
        line(x, this.pos.y, x, this.pos.y + this.size.y);
    }
}

function preload() {
    let url = "https://pomber.github.io/covid19/timeseries.json";
    cases = loadJSON(url);
}
function changeGuiOpacity(targetOpacity = 1.0){
	Array.from(document.getElementsByClassName('dg')).forEach(function(element, index, array) { element.style.opacity = targetOpacity; });
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 40);
    
    let allCountries = [];
    let countryNames = [];
    
    for(let country in cases) {
        let c = cases[country];
        if(c[c.length-1]["confirmed"] > 0) countryNames.push(country);
        for(let i = 0; i < c.length; i++) {
            if(allCountries.length <= i) {
                allCountries.push(c[i]);
            } else if(allCountries.length == c.length) {
                allCountries[i]["confirmed"] += c[i]["confirmed"];
                allCountries[i]["deaths"] += c[i]["deaths"];
                allCountries[i]["recovered"] += c[i]["recovered"];
            }
        }
    }
    cases["World"] = allCountries;
    countryNames.sort();
    countryNames.unshift("World");
    
    myGraph = new Graph(createVector(50, 30), 
                        createVector(width - 70, height - 60), 
                        cases["World"]);
    noLoop();   
    var gui = new dat.GUI();
	
    gui.add(myGraph, 'selectedCountry', countryNames)
        .onChange(v => myGraph.changeData(cases[v]));
    gui.add(myGraph, 'doublingTime')
        .min(2)
        .max(20)
        .onChange(v => myGraph.update());
    gui.add(myGraph, 'fatalatyRate')
        .min(0.001)
        .max(1.0)
        .step(0.001)
        .onChange(v => myGraph.update())
    
    gui.add(myGraph, 'infectionToDeath')
        .min(7)
        .max(49)
        .onChange(v => myGraph.update());
    gui.add(myGraph, 'showEstimated')
        .onChange(v => myGraph.update());
    
    gui.close();
    changeGuiOpacity(0.55);
    gui.domElement.onmouseover = function() { changeGuiOpacity(); };
    gui.domElement.onmouseout = function() { changeGuiOpacity(0.55); };
}

function mouseMoved() {
    background(221);
    myGraph.show();
}

