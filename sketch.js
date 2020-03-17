let cases;
let myGraph;

const CASES_CONFIRMED = "confirmed";
const CASES_DEATH = "deaths";
const CASES_RECOVERED = "recovered";
const CASES_ESTIMATED = "estimated";

class Graph {
    constructor(pos, size, data) {
        this.pos = pos;
        this.size = size;
        this.data = data;
        
        this.doublingTime = 6;
        this.fatalatyRate = 0.01;
        this.infectionToDeath = 21;
        
        this.selectedCountry = "World";
        
        this.showMouseOver = true;
        this.showEstimated = true;
        
        this.colors = {[CASES_DEATH] : color("#cb4f5c"), 
                       [CASES_CONFIRMED] : color("#002b5c"), 
                       [CASES_ESTIMATED] : color("#bb8600"), 
                       [CASES_RECOVERED] : color("#5c7b00")};
        this.update();
    }
    
    update() {
        this.createProjectedCasesFromDeaths();
        this.calculateMaxValue();
        this.calculateStats();
        
        background(221);
        this.show();
    }
    
    changeData(d) {
        this.data = d;
        this.update();
    }
    
    calculateStats() {
        let today = this.data.length - 1;
        
        if(this.data[floor(today - this.infectionToDeath)][CASES_CONFIRMED] > 0) 
            this.caseFatalityRate = this.data[today][CASES_DEATH] / this.data[floor(today - this.infectionToDeath)][CASES_CONFIRMED];
        else 
            this.caseFatalityRate = undefined;
        
        if(this.data[today][CASES_CONFIRMED] > 0) 
            this.caseFatalityRateToday = this.data[today][CASES_DEATH] / this.data[today][CASES_CONFIRMED];
        else 
            this.caseFatalityRateToday = undefined;
        
        let growSum = 0;
        let numDays = 0;
        for(let i = 0; i < today; i++) {
            let j = this.data[i][CASES_CONFIRMED];
            if(j > 0)  {
                growSum += (this.data[i + 1][CASES_CONFIRMED] - j) / j;
                numDays += 1;
            }
        }
        if(numDays > 0) {
            this.confirmedGrowRate = growSum / numDays;
            this.confirmedDoublingRate = 70 / (this.confirmedGrowRate * 100);
        }
        else {
            this.confirmedGrowRate = undefined;
            this.confirmedDoublingRate = undefined;
        }
    }
    
    calculateMaxValue() {
        let maxV = 0;
        for(let d of this.data) {
            maxV = max(maxV, d[CASES_DEATH]);
            if(this.showEstimated) maxV = max(maxV, d[CASES_ESTIMATED]);
            maxV = max(maxV, d[CASES_CONFIRMED]);
            maxV = max(maxV, d[CASES_RECOVERED]);
        }
        this.maxValue = maxV;
    }
    
    createProjectedCasesFromDeaths() {
        let multiplierSinceDayOfInfection = pow(2, this.infectionToDeath / this.doublingTime);
        for(let d of this.data) {
            d[CASES_ESTIMATED] = d[CASES_DEATH] / this.fatalatyRate * multiplierSinceDayOfInfection;
        }
    }
    
    showData(s, y) {
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
    
    showStats() {
        textSize(12);
        noStroke();
        textAlign(LEFT);
        fill(0);
        textStyle(BOLD);
        
        let today = this.data.length - 1;
        
        text("today", this.pos.x + 10, this.pos.y + 20);
        
        textStyle(NORMAL);
        
        fill(this.colors[CASES_CONFIRMED]);
        text(CASES_CONFIRMED + ": " + nfc(floor(this.data[today][CASES_CONFIRMED])), 
             this.pos.x + 10, 
             this.pos.y + 40);
        fill(this.colors[CASES_DEATH]);
        text(CASES_DEATH + ": " + nfc(floor(this.data[today][CASES_DEATH])), 
             this.pos.x + 10, 
             this.pos.y + 60);
        fill(this.colors[CASES_RECOVERED]);
        text(CASES_RECOVERED + ": " + nfc(floor(this.data[today][CASES_RECOVERED])), 
             this.pos.x + 10, 
             this.pos.y + 80);
        fill(this.colors[CASES_ESTIMATED]);
        if(this.showEstimated) {
            text(CASES_ESTIMATED + ": " + nfc(floor(this.data[today][CASES_ESTIMATED])), 
                 this.pos.x + 10, 
                 this.pos.y + 100);
            fill(51);
            textSize(8);
            text("using doubling time = " + nfc(this.doublingTime,1) + " days, fatality rate = " + nfc(this.fatalatyRate, 3) + " %, time between infection and death = " + nfc(this.infectionToDeath,0) + " days", 
                 this.pos.x + 10, 
                 this.pos.y + 116);
        }
        
        
        textSize(10);
        fill(0);
        noStroke();
        textAlign(LEFT);
        if(this.caseFatalityRate != undefined) 
            text("case fatality rate (- " + ceil(this.infectionToDeath) + "): " + nfc(this.caseFatalityRate * 100, 1) + " %", 
                 this.pos.x + 10, 
                 this.pos.y + 140);
        else 
            text("case fatalatiy rate (- " + this.infectionToDeath + ") not available", 
                  this.pos.x + 10, 
                  this.pos.y + 140);
        
        if(this.caseFatalityRateToday != undefined) 
            text("case fatality rate (today) : " + nfc(this.caseFatalityRateToday * 100, 1) + " %", 
                 this.pos.x + 10, 
                 this.pos.y + 160);
        else 
            text("case fatalatiy rate (today) not available", 
                 this.pos.x + 10, 
                 this.pos.y + 160);
        
        if(this.confirmedGrowRate != undefined) 
            text("confirmed growth rate: " + nfc(this.confirmedGrowRate * 100, 1) + " %", 
                 this.pos.x + 10, 
                 this.pos.y + 180);
         else 
             text("confirmed growth rate not available", 
                 this.pos.x + 10, 
                 this.pos.y + 180);
        
    
        if(this.confirmedDoublingRate != undefined) 
            text("confirmed doubling time: " + nfc(this.confirmedDoublingRate, 1) + " days", 
                 this.pos.x + 10, 
                 this.pos.y + 200);
         else 
             text("confirmed doubling time not available", 
                 this.pos.x + 10, 
                 this.pos.y + 200);
        
        
        
    }
    
    showBorder() {
        textSize(8);
        
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
        
        noFill();
        stroke(0);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    
    showGraph() {
        this.showData(CASES_CONFIRMED, 0);
        this.showData(CASES_DEATH, 1);
        this.showData(CASES_RECOVERED, 2);
        if(this.showEstimated) this.showData(CASES_ESTIMATED, 3);
    }
    
    showTitle() {
        textSize(20);
        textStyle(BOLD);
        textAlign(CENTER);
        noStroke();
        fill(0);
        if(this.selectedCountry == "World") text("covid-19 worldwide", 
             width / 2, 
             this.pos.y - 10);
        else {
            text("covid-19 in " + this.selectedCountry, 
             width / 2, 
             this.pos.y - 10);
        }
    }
    
    showMouseOverInfo() {
        textStyle(NORMAL);
        
        textSize(12);
        noStroke();
        
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
        fill(this.colors[CASES_CONFIRMED]);
        text(nfc(this.data[i][CASES_CONFIRMED]), mouseX + delta, mouseY + 30);
        
        fill(this.colors[CASES_DEATH]);
        text(nfc(this.data[i][CASES_DEATH]), mouseX + delta, mouseY + 50);
        
        fill(this.colors[CASES_RECOVERED]);
        text(nfc(this.data[i][CASES_RECOVERED]), mouseX + delta, mouseY + 70);
        
        fill(this.colors[CASES_ESTIMATED]);
        if(this.showEstimated) text(nfc(floor(this.data[i][CASES_ESTIMATED])), mouseX + delta, mouseY + 90);
        
        
        stroke(181);
        let x = i * (this.size.x / this.data.length) + this.pos.x;
        line(x, this.pos.y, x, this.pos.y + this.size.y);
    }
    
    show(){
        this.showTitle();
        this.showStats();
        this.showBorder();
        this.showGraph();
        if(this.showMouseOver == true) this.showMouseOverInfo();
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
        if(c[c.length-1]["confirmed"] > 0) 
            countryNames.push(country);
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
    
    gui.add(myGraph, 'showMouseOver');
    
    gui.close();
    changeGuiOpacity(0.55);
    gui.domElement.onmouseover = function() { changeGuiOpacity(); };
    gui.domElement.onmouseout = function() { changeGuiOpacity(0.55); };
}

function keyPressed() {
    console.log(keyCode);
    if(keyCode == 83) saveCanvas("graph.png");
}

function mouseMoved() {
    background(221);
    myGraph.show();
}
