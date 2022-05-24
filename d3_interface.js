// Constants
//Margin (top, right, bottom, left), width, height
var m = [30, 40, 20, 50],
// var m = [30, 40, 20, 175],
    w = 700 - m[1] - m[3],
    h = 700 - m[0] - m[2];
var deg2rad = (Math.PI/180);
var tan = Math.tan(55*deg2rad),
    basep = 1050,
    topp = 100,
    plines = [1000,850,700,500,300,200,100]
    pticks = [950,900,800,750,650,600,550,450,400,350,250,150]
    mixTicksTop = [0.1, 0.2, 0.6, 1.0, 2.0, 3.0, 5.0]
    mixTicksRight = [10.0, 20.0, 40.0]
    barbsize = 25;
var map_scale=1000;
var playingDilla = 0;
// Unit conversion magic
var units = 'c';
var wndUnits = 'kt';
var pwatUnits = 'mm';
var unit = toC;
var wnd_unit = toKT;
var pwat_unit = toMM;


var start = true;
var dgzBool = false, dgzGain = false, rainGain = false, CAPEgainBool=false, CAPEgain = 0, snow_amb = false, rain_amb = false;

// Constants for Mixing Ratio calculations
var g = 9.8076, Hv = 2501000, Rsd = 287, cpd = 1003.5, eps = 0.622, Lv = 2501;
// Inputs mixing ratio and pressure, outputs temperature (for drawing mixing ratio lines)
function temp_from_mixratio(MixRatio, MBpressure) {
	var VaporPress;
	var Ctemp;
  	VaporPress = MixRatio * MBpressure / (621.97 + MixRatio);
	Ctemp = 237.7*Math.log10(VaporPress/6.11)/(7.5-Math.log10(VaporPress/6.11));
	return Ctemp; 
	}

// Inputs temp and pressure, outputs mixing ratio (for moist adiabats)
function mixratio_from_temp(Ctemp, MBpressure) {
	var VaporPress;
	var MixRatio;
	VaporPress = 6.11 * Math.log10(7.5*Ctemp/(237.7+Ctemp));
	MixRatio = eps * VaporPress / (MBpressure - VaporPress);
	return MixRatio;
	}
	
// Inputs temp and pressure, returns vapor pressure
function vapor_press_from_temp(Ctemp, MBpressure) {
	var VaporPress;
	VaporPress = 6.11 * Math.log10(7.5*Ctemp/(237.7+Ctemp));
	return VaporPress;
	}

// Calculate condensation temperature (for moist adiabats)
function Tc(T,e){
	Tmpc = (2840/(3.5*Math.log(T)-Math.log(e)-4.805)+55) + 273.15;
	return Tmpc;
	}

function Te(T, r){
	TmpE = T + (Lv/cpd) * r;
	return TmpE;
	}

// 
// 
// // GET DATA
// function getData(year, month, time, stdid){
// var dataURL = 'http://weather.uwyo.edu/cgi-bin/sounding?region=naconf&TYPE=TEXT%3ALIST'
//                 '&YEAR='+year+'&MONTH='+month+'&FROM='+time+'&TO='+time+'
//                 '&STNM='+stdid;
// 
//                 
// }



document.addEventListener('keydown', (c) => {
	if(c.key == 'c' && capecinshow==0 && SBCAPE>0){
		cape.style("display", null);
		cin.style("display", null);
		capecinshow=1;
		}else if(c.key == 'c' && capecinshow == 1){
		cape.style("display", "none");
		cin.style("display", "none");
		capecinshow=0;
		}
	else if(c.key == 'u' && units == 'f'){
		unit = toC;
		console.log('to C');
		units = 'c';
	} else if(c.key == 'u' && units == 'c'){
		unit = toF;
		console.log('to F');
		units = 'f';
	}
	else if(c.key == 'w' && wndUnits == 'kt'){
		wnd_unit = toMS;
		console.log('wind to m/s');
		wndUnits = 'ms';
	} else if(c.key == 'w' && wndUnits == 'ms'){
		wnd_unit = toMPH;
		console.log('wind to mph');
		wndUnits = 'mph';
	} else if(c.key == 'w' && wndUnits == 'mph'){
		wnd_unit = toKT;
		console.log('wind to kts');
		wndUnits = 'kt';
		
	} else if(c.key == 'p' && pwatUnits == 'mm'){
		pwat_unit = toIN;
		console.log('pwat to in');
		pwatUnits = 'in';
	} else if(c.key == 'p' && pwatUnits == 'in'){
		pwat_unit = toMM;
		console.log('pwat to mm');
		pwatUnits = 'mm';
	}
	});


// Create array of piano key frequencies (function at bottom of script)
var keyboard=[], diatonic=[], whole_tone=[], diminished1=[], diminished2=[];

function scale_select(){
	scale = document.getElementById("scale_select").value;
	if(scale=='chrm'){
	chosenScale = keyboard;
	} else if(scale=='dtnc'){
	chosenScale = diatonic;
	} else if(scale=='WT'){
	chosenScale = whole_tone;
	} else if(scale=='dim1'){
	chosenScale = diminished1;
	} else if(scale=='dim2'){
	chosenScale = diminished2;
	}
	startSound();
}

keyboardsPopulate();
// Initially load diatonic scale
var chosenScale = diatonic;

var key_index = 0, key_index2 = 0;

document.onclick = startSound;

var audioCtx, volume1, volume2, sinea, ss = 0, ss2 = 0, ss3 = 0, capecinshow=0, left_pan, right_pan;

function startSound(){
if(ss==0){
	audioCtx = new (window.AudioContext || window.webkitAudioContext);
	left_pan = audioCtx.createPanner();
	right_pan = audioCtx.createPanner();
	left_pan2 = audioCtx.createPanner();
	right_pan2 = audioCtx.createPanner();
	
	volume1 = audioCtx.createGain();
	volume1.connect(audioCtx.destination)
	volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 1);
	
	volume2 = audioCtx.createGain();
	volume2.connect(audioCtx.destination)
	volume2.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 1);
	
	volume3 = audioCtx.createGain();
	volume3.connect(audioCtx.destination)
	volume3.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 1);
	ss = 1;
} else if(ss==1){
	volume1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + .08);
	volume2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + .08);
	
	// Allow ramp down of volume to finish before cutting off audio
	setTimeout(function(){
		audioCtx.close();
		}, 100);
	ss = 0;
}
}

// Scales and axes. Note the inverted domain for the y-scale: bigger is up!
var x = d3.scale.linear().range([0, w]).domain([-45,50]),
    y = d3.scale.log().range([0, h]).domain([topp, basep])
    r = d3.scale.linear().range([0,300]).domain([0,150]),
    y2 = d3.scale.linear();

var xAxis = d3.svg.axis().scale(x).tickSize(0,0).ticks(10).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).tickSize(0,0).tickValues(plines)
              .tickFormat(d3.format(".0d")).orient("left");

// Initialize arrays for data parsing
var midiPitch;
var hodobarbstest = [], tlinetest = [], tdlinetest=[], barbstest = [], DGZtest=[], CINtest=[];
var mouseoverdata = [], hodobarbs=[], barbs=[], parsedCSV=[], data2=[], DGZ=[];
var someBarbs = [], press=[];
var hodoLen=0;

// Instability parameters (static)
var showalter='', LI='', LIFT='', SWEAT='', K_ind='', CT='', VT='', TT='', SBCAPE='',
SBCIN ='', MLCAPE='', MLCIN='', CAPV='', CINV='', BRN='', CAPV_BRN='', SBEL='', MLEL='', Tv_EL='', 
Tv_LFCT='', LCL_T='', LCL_p='', LFCT='', ML_theta='', ML_mix='', thickness='', PWAT='', 
dwptlen=0, U_max=0, V_max=0, lat, lon, dgzBool, station, timedate2='';

// Get the data
function upload_data(){

var csv_file = String(document.getElementById("exampleSoundings").value);
d3.csv(csv_file, function(error, data) {
// 	if (error) throw error;
    // Convert numerical data from strings to numbers
	data.forEach(function(d) {
	d.dewpoint = +d.dewpoint;
	d.direction = +d.direction;
	d.elevation = +d.elevation;
	d.height = +d.height;
	d.pressure = +d.pressure;
	d.speed = +d.speed;
	d.temperature = +d.temperature;
	d.u_wind = +d.u_wind;
	U_max = Math.abs(d.u_wind) > U_max ? Math.abs(d.u_wind) : U_max;
	d.v_wind = +d.v_wind;
	V_max = Math.abs(d.v_wind) > V_max ? Math.abs(d.v_wind) : V_max;
	d.parcel_T = +d.parcel_T;
	station_name = d.station_name;
	station = "tester1";
	dwptlen = d.dewpoint.length;
	lat = d.latitude;
	lon = d.longitude;
	day = d.time;
	hour = d.hour;
	
	// Store instability parameters
	showalter = +d.showalter;
	LI = +d.LI;
	Tv_LI = +d.Tv_LI;
	SWEAT = +d.SWEAT;
	K_ind = +d.K_ind;
	CT = +d.CT;
	VT = +d.VT;
	TT = +d.TT;
	
	SBCAPE = +d.SBCAPE > 0 ? d.SBCAPE : String(0);
	SBCIN = +d.SBCAPE > 0 ? d.SBCIN : String(0);
	PWAT = d.PWAT;
	
	SRH1k = d.SRH1k;
	SRH3k = d.SRH3k;
	});
	timedate2 = day+'-'+hour;
	
	// Filter data to discard strange or irrelevant values
	parsedCSV = data.filter(function(d) { return (d.temperature > -1000 && d.dewpoint > -1000 && d.pressure >=100); }); 
	CINdata = data.filter(function(d) { return (d.temperature > -1000 && d.dewpoint > -1000 && d.pressure >=SBEL); }); 
	tdData = data.filter(function(d) { return d.dewpoint <= d.temperature});
	DGZ = data.filter(function(d) { return ((-18 <= d.temperature) && (d.temperature <= -12)) });
	barbs = parsedCSV.filter(function(d) { return (d.direction >= 0 && d.speed >= 0 && d.pressure >= topp); });
	hodobarbs = barbs.filter(function(d) { return (d.pressure >= 100); });

	
	// Show 30 barbs every time...IF there are at least 30
	if(barbs.length >=30){
		interval = barbs.length/30
		for (i=0; i<30; i++){
			someBarbs.push(barbs[Math.ceil(interval*i)]);
			};
		} else {
			for(i=0; i<barbs.length; i++){
				someBarbs.push(barbs[i]);
				}
		}
	  
	// Push filtered data into temp arrays
    tlinetest.push(parsedCSV);
    CINtest.push(CINdata);
    tdlinetest.push(tdData);
    barbstest.push(barbs);
    hodobarbstest.push(hodobarbs);
    
    // Only show DGZ if surface temperature is close to freezing (less than 1 deg C)
    if(data[0].temperature<=2){
    DGZtest.push(DGZ);
    dgzBool=true;
    }

    drawFirstHour();
    
    });
 };
 
 function drawFirstHour(){
    
	mouseoverdata = parsedCSV.slice().reverse();	
	
    tline = skewtgroup.selectAll("tline")
        .data(tlinetest).enter().append("path")
          .attr("class", "temperature")
          .attr("clip-path", "url(#clipper)")
          .attr("d", line);
      
    dgz = skewtgroup.selectAll("dgz")
    	.data(DGZtest).enter().append("path")
    	  .attr("class", "dgz")
    	  .attr("clip-path", "url(#clipper)")
    	  .attr("d", line);
    	  
    tdline = skewtgroup.selectAll("tdline")
        .data(tdlinetest).enter().append("path")
          .attr("class", "dewpoint")
          .attr("clip-path", "url(#clipper)")
          .attr("d", line2);
          
    parcel = skewtgroup.selectAll("parcel")
    	.data(tlinetest).enter().append("path")
    	  .attr("class", "parcel")
    	  .attr("clip-path", "url(#clipper)")
    	  .attr("d", line3);
    	  
    cape = skewtgroup.selectAll("cape")
  		.data(tlinetest).enter().append("path")
  		  .style("fill", "red")
  		  .style("fill-opacity", .5)
  		  .style("display", "none")
  		  .attr("class", "cape")
  		  .attr("d", T_Tp_Difference)
  		  .attr("transform","scale(1,-1), translate(26,-625.45), rotate(-90 300 325)");
  		  
    cin = skewtgroup.selectAll("cin")
  		.data(CINtest).enter().append("path")
  		  .style("fill", "blue")
  		  .style("fill-opacity", .5)
  		  .style("display", "none")
  		  .attr("class", "cin")
  		  .attr("d", Tp_T_Difference)
  		  .attr("transform","scale(1,-1), translate(26,-625.45), rotate(-90 300 325)");
    
    holine = hodogroup.selectAll("hodoline")
        .data(hodobarbstest).enter().append("path")
    	.attr("class", "hodoline")
    	.attr("id", "hodoline1")
    	.attr("d", hodoline);
    
    hodoLen = hodogroup.select("path").node().getTotalLength();
    
    allbarbs = barbgroup.selectAll("allbarbs")
        .data(someBarbs).enter().append("use")
    	.attr("xlink:href", function (d) { return "#barb"+(Math.ceil(d.speed/5)*5); })
    	.attr("transform", function(d) { return "translate("+w+","+y(d.pressure)+") rotate("+(d.direction+180)+")"; });
    	
// Instability Parameters (static)
// SBCAPE
  SBCAPE_txt = indx_texts.append("g").attr("class", "focus sbcape").style("display", null);
  SBCAPE_txt.append("text").text("SBCAPE: " + SBCAPE.slice(0,6) +" J/kg").attr("x", 0).attr("text-anchor", "start").attr("dy", "3.0em");
// SBCIN
  SBCIN_txt = indx_texts.append("g").attr("class", "focus sbcin").style("display", null);
  SBCIN_txt.append("text").text("SBCIN: " + SBCIN.slice(0,5) +" J/kg").attr("x", 0).attr("text-anchor", "start").attr("dy", "4.5em");

// Storm Relative Helicity (SRH) 0-1km
  SRH1k_txt = indx_texts.append("g").attr("class", "focus srh1").style("display", null);
  SRH1k_txt.append("text").text("0-1km SRH: " +SRH1k+" m\u00B2/s\u00B2").attr("x", 0).attr("text-anchor", "start").attr("dy", "6.0em");
//   Storm Relative Helicity (SRH) 0-3km
  SRH3k_txt = indx_texts.append("g").attr("class", "focus srh3").style("display", null);
  SRH3k_txt.append("text").text("0-3km SRH: " +SRH3k+" m\u00B2/s\u00B2").attr("x", 0).attr("text-anchor", "start").attr("dy", "7.5em");	

}
// Various path generators:

// Temperature
var line = d3.svg.line()
    .x(function(d) { return x(d.temperature) + (y(basep)-y(d.pressure))/tan; })
    .y(function(d) { return y(d.pressure); })
    .interpolate("linear");
    
// Dewpoint    
var line2 = d3.svg.line()
    .x(function(d) { return x(d.dewpoint) + (y(basep)-y(d.pressure))/tan; })
    .y(function(d) { return y(d.pressure); })
    .interpolate("linear");
    
// Parcel path (temperature)
var line3 = d3.svg.line()
    .x(function(d) { return x(d.parcel_T) + (y(basep)-y(d.pressure))/tan; })
    .y(function(d) { return y(d.pressure); })
    .interpolate("linear");

// Shading CAPE and CIN:

//CIN
var Tp_T_Difference = d3.svg.area()
	.x(function(d,i) { return y(d.pressure) })
	.y0(function(d) { return Math.max((x(d.temperature) + (y(basep)-y(d.pressure))/tan), (x(d.parcel_T) + (y(basep)-y(d.pressure))/tan)) })
	.y1(function(d) { return x(d.parcel_T) + (y(basep)-y(d.pressure))/tan; })
	.interpolate("linear");
  
//CAPE
var T_Tp_Difference = d3.svg.area()
	.x(function(d,i) { return y(d.pressure) })
	.y0(function(d) { return Math.max((x(d.parcel_T) + (y(basep)-y(d.pressure))/tan), (x(d.temperature) + (y(basep)-y(d.pressure))/tan)) })
	.y1(function(d) { return x(d.temperature) + (y(basep)-y(d.pressure))/tan; })
	.interpolate("linear");
    
   
// Hodograph wind
var hodoline = d3.svg.line.radial()
    .radius(function(d) { return r(d.speed); })
    .angle(function(d) { return (d.direction+180)*(Math.PI/180); });
    
// bisector function for tooltips    
var bisectTemp = d3.bisector(function(d) { return d.pressure; }).left;

// create svg container for sounding    
var svg = d3.select("div#mainbox").append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])      
      .append("g")
      .attr("class", "skewt_g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var svgTxt = d3.select("div#btmBox").append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", 160)      
      .append("g")
      .attr("class", "skewt_g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
      
var indx_texts = d3.select("div#btmBox svg").append("g")
      .attr("class", "indx_txt")
      .attr("transform", "translate(0,20)");
    
// create svg container for hodograph
var svghodo = d3.select("div#hodobox").append("svg")
      .attr("width", 300)
      .attr("height", 300)
      .append("g")
      .attr("transform", "translate(150,150)");
      	  
// create svg container for text below hodograph
var hodoTextBox = d3.select("div#hodobox").append("svg")
	.attr("width", 300)
	.attr("height", 165)
	.append("g")
	.attr("transform", "translate(0,25)");


var skewtgroup = svg.append("g").attr("class", "skewt").attr("id", "skewt"); // put skewt lines in this group
var barbgroup  = svg.append("g").attr("class", "windbarb"); // put barbs in this group
var hodogroup = svghodo.append("g").attr("class", "hodo"); // put hodo stuff in this group
var hodoText = hodoTextBox.append("g").attr("class", "hodoFocus");
       
function makeBarbTemplates() {
    var speeds = d3.range(5,185,5);
    barbdef = svg.append('defs')
    speeds.forEach(function(d) {
    	var thisbarb = barbdef.append('g').attr('id', 'barb'+d);
    	var flags = Math.floor(d/50);
        var pennants = Math.floor((d - flags*50)/10);
        var halfpennants = Math.floor((d - flags*50 - pennants*10)/5);
        var px = barbsize;
        	    
		// Draw wind barb stems
		thisbarb.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", 0)
			.attr("y2", barbsize)
			.attr("stroke","black");
     
    	// Draw wind barb flags and pennants for each stem
	    for (i=0; i<flags; i++) {
     		thisbarb.append("polyline")
                .attr("points", "0,"+px+" -10,"+(px)+" 0,"+(px-4))
     		    .attr("class", "flag")
     		    .attr("stroke","black");
     		 px -= 7;
     	}
	    // Draw pennants on each barb
	    for (i=0; i<pennants; i++) {
    	    thisbarb.append("line")
     		    .attr("x1", 0)
     		    .attr("x2", -10)
     		    .attr("y1", px)
     		    .attr("y2", px+4)
     		    .attr("stroke","black");
     		px -= 3;
     	}
     	// Draw half-pennants on each barb
        for (i=0; i<halfpennants; i++) {
    	    thisbarb.append("line")
     		    .attr("x1", 0)
     		    .attr("x2", -5)
     		    .attr("y1", px)
     		    .attr("y2", px+2)
     		    .attr("stroke","black");
     		px -= 3;
     	}
    });
}

var sel='T_Td'
function select_sonify(){
	sel = document.getElementById("sonify_select").value;
	startSound();
	if(sel=='T_Tp' || sel=='Tp'){
	focus.select("text").attr("x", -9).attr("text-anchor", "end");
	} else {
	focus.select("text").attr("x", 9).attr("text-anchor", "start");
	}
}

// Draw T/Td tooltips
function drawToolTips() {
  
  // Circles and values that appear w/ mouseover
  //Temperature
  focus = skewtgroup.append("g").attr("class", "focus temperature").style("display", "none");
  focus.append("circle").attr("r", 4);
  focus.append("text").attr("x", 9).attr("dy", ".35em").attr("class", "tmp_text").attr("stroke", "none");
  
  // Dewpoint
  focus2 = skewtgroup.append("g").attr("class", "focus dewpoint").style("display", "none");
  focus2.append("circle").attr("r", 4);
  focus2.append("text").attr("x", -9).attr("text-anchor", "end").attr("class", "dpt_text").attr("dy", ".35em").attr("stroke", "none");
  
  // Parcel T
  focus2b = skewtgroup.append("g").attr("class", "focus parcel").style("display", "none");
  focus2b.append("circle").attr("r", 4);
  focus2b.append("text").attr("x", 9).attr("text-anchor", "start").attr("class", "prcl_text").attr("dy", ".35em").attr("stroke", "none");
  
  // Height
  focus3 = skewtgroup.append("g").attr("class", "focus").style("display", "none");
  focus3.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", ".35em");
  
  //Hodo dot
  focus3b = hodogroup.append("g").attr("class", "focus hodo dot").style("display", "none");
  focus3b.append("circle").attr("r",4);
  
  // Hodo speed
  focus4 = hodoText.append("g").attr("class", "focus hodo spd").style("display", null);
  focus4.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "1.0em").text("Speed: ");
  
  // Hodo direction
  focus5 = hodoText.append("g").attr("class", "focus hodo dir").style("display", null);
  focus5.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "2.5em").text("Direction: ");
  
  // Hodo cardinal direction
  focus6 = hodoText.append("g").attr("class", "focus hodo card").style("display", null);
  focus6.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "4.0em").text("Cardinal Direction: ");
  
  // Moisture parameters (static)
  // Dewpoint Depression
  focus7 = hodoText.append("g").attr("class", "focus dwpt dep").style("display", null);
  focus7.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "5.5em").text("Dewpoint Depression: ");
    
  // Parcel Temp - Environmental Temp
  focus17 = hodoText.append("g").attr("class", "focus tp").style("display", null);
  focus17.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "7.0em").text("T - Tp: ");
  
  // Precipitable Water
  focus16 = hodoText.append("g").attr("class", "focus pwat").style("display", null);
  focus16.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", "8.5em");
  
  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "none")
      .on("mouseenter", function() { focus.style("display", null); focus2.style("display", null); 
      								focus3.style("display", null); focus3b.style("display", null); focus4.style("display", null);
									if(ss==1 && sel=='T_Td'){
      									sine_temp = audioCtx.createOscillator();
										sine_temp.type = "sine";
										sine_temp.connect(right_pan, 0, 0);
										right_pan.setPosition(1, 0, 0);// play on the right channel
										right_pan.connect(volume1);
										sine_temp.start();
									
										sine_dwpt = audioCtx.createOscillator();
										sine_dwpt.type = "sine";
										sine_dwpt.connect(left_pan, 0, 0);
										left_pan.setPosition(-1, 0, 0);// play on the left channel
										left_pan.connect(volume2);
										sine_dwpt.start();
										
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
										volume2.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='T'){
      									sine_temp = audioCtx.createOscillator();
										sine_temp.type = "sine";
										sine_temp.connect(volume1);
										sine_temp.start();
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='Td'){
      									sine_dwpt = audioCtx.createOscillator();
										sine_dwpt.type = "sine";
										sine_dwpt.connect(volume1);
										sine_dwpt.start();
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='DD'){
      									sine_dd = audioCtx.createOscillator();
										sine_dd.type = "sine";
										sine_dd.connect(volume1);
										sine_dd.start();
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
									} else if(ss==1 && sel=='T_Tp'){
										focus2b.style("display", null); 
										focus2.style("display", "none");
									
										sine_temp = audioCtx.createOscillator();
										sine_temp.type = "sine";
										sine_temp.connect(right_pan, 0, 0);
										right_pan.setPosition(1, 0, 0);// play on the right channel
										right_pan.connect(volume1);
										sine_temp.start();
										
										// For CIN
      									sine_tp = audioCtx.createOscillator();
										sine_tp.type = "sine";
										sine_tp.connect(left_pan, 0, 0);
										left_pan.setPosition(-1, 0, 0);// play on the left channel
										left_pan.connect(volume2);
										sine_tp.start();
										
										// For CAPE
										saw_tp = audioCtx.createOscillator();
										saw_tp.type = "sawtooth";
										saw_tp.connect(left_pan2, 0, 0);
										left_pan2.setPosition(-1, 0, 0);// play on the left channel
										left_pan2.connect(volume3);
										saw_tp.start();
										
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
										volume2.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
										volume3.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='Tp'){
      									focus2b.style("display", null); 
      									focus2.style("display", "none");
      									
      									sine_tp = audioCtx.createOscillator();
										sine_tp.type = "sine";
										sine_tp.connect(volume1);
										sine_tp.start();
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
										
										saw_tp = audioCtx.createOscillator();
										saw_tp.type = "sawtooth";
										saw_tp.connect(volume3);
										saw_tp.start();
										volume3.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='speed'){
      									sine_speed = audioCtx.createOscillator();
										sine_speed.type = "sine";
										sine_speed.connect(volume1);
										sine_speed.start();
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      								} else if(ss==1 && sel=='dir'){
      									// sine_U = audioCtx.createOscillator();
// 										sine_U.type = "sine";
// 										sine_U.connect(right_pan, 0, 0);
// 										right_pan.connect(volume1);
// 										sine_U.start();
										
										sine_V = audioCtx.createOscillator();
										sine_V.type = "sine";
										sine_V.connect(right_pan, 0, 0);
										right_pan.connect(volume1);
										sine_V.start();
										
										volume1.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
										volume2.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      								}
      								})
      .on("mouseout", function() { focus.style("display", "none"); focus2.style("display", "none"); 
      								focus3.style("display", "none"); focus3b.style("display", "none"); focus4.select("text").text("Speed: "); focus5.select("text").text("Direction: "); 
      								focus6.select("text").text("Cardinal Direction: "); focus7.select("text").text("Dewpoint Depression: "); focus17.select("text").text("Tp - T: ");
	  								ss2=0;
	  								ss3=0;
      								volume1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.01);
      								volume2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.01);
      								volume3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.01);

      								setTimeout(function(){
    								if(ss==1 && sel=='T_Td'){
    									sine_temp.stop();
      									sine_dwpt.stop();;
      								} else if(ss==1 && sel=='T'){
      									sine_temp.stop();
      								} else if(ss==1 && sel=='Td'){
      									sine_dwpt.stop();
      								} else if(ss==1 && sel=='DD'){
      									sine_dd.stop();
									} else if(ss==1 && sel=='T_Tp'){
										focus2b.style("display", "none"); 
										sine_temp.stop();
										sine_tp.stop();
										saw_tp.stop();
      								} else if(ss==1 && sel=='Tp'){
      									focus2b.style("display", "none"); 
      									sine_tp.stop();
      									saw_tp.stop();
      								} else if(ss==1 && sel=='speed'){
      									sine_speed.stop();
      								} else if(ss==1 && sel=='dir'){
//       									sine_U.stop();
      									sine_V.stop();
      									}	
									}, 10);
      								})
      .on("mousemove", mousemove);
    
var key_index, key_index2;   
	function mousemove() {
      var y0 = y.invert(d3.mouse(this)[1]); // get y value of mouse pointer in pressure space
      y1 = d3.mouse(this)[1];

	  var i = bisectTemp(mouseoverdata, y0, 1, mouseoverdata.length-1);
      var d0 = mouseoverdata[i - 1];
      var d1 = mouseoverdata[i];
      var d = y0 - d0.pressure > d1.pressure - y0 ? d1 : d0;

      	if(ss==1 && sel=='T_Td'){
			key_index = Math.round((d.temperature+80)*chosenScale.length/130);
			sine_temp.frequency.value = chosenScale[key_index];
			
	  		key_index2 = Math.round((d.dewpoint+100)*chosenScale.length/140);
			sine_dwpt.frequency.value = chosenScale[key_index2];

	  	} else if(ss==1 && sel=='T'){
			key_index = Math.round((d.temperature+80)*chosenScale.length/130);
			sine_temp.frequency.value = chosenScale[key_index];
	  	} else if(ss==1 && sel=='Td'){
			key_index = Math.round((d.dewpoint+100)*chosenScale.length/140);
			sine_dwpt.frequency.value = chosenScale[key_index];
	  	} else if(ss==1 && sel=='DD'){
			key_index = Math.round(((d.temperature-d.dewpoint))*chosenScale.length/80);
			sine_dd.frequency.value = chosenScale[key_index];
	  	} else if(sel=='T_Tp'){
	  		focus2b.attr("transform", "translate(" + (x(d.parcel_T) + (y(basep)-y(d.pressure))/tan)+ "," + y(d.pressure) + ")");
	  		focus2b.select("text").text(unit(Math.round(d.parcel_T)));
	  		focus2b.style("display", (d.parcel_T < d.temperature && d.height > 12000 ? "none" : null));
	  		
	  		if (d.parcel_T < d.temperature) { 
      			focus.select("text").attr("x", 9).attr("text-anchor", "start") 
      			focus2b.select("text").attr("x", -9).attr("text-anchor", "end")
      		} else { 
      			focus.select("text").attr("x", -9).attr("text-anchor", "end")
      			focus2b.select("text").attr("x", 9).attr("text-anchor", "start") 
      		};
	  		
	  		key_index = Math.round((d.temperature+80)*chosenScale.length/130);
			sine_temp.frequency.value = chosenScale[key_index];
			
			key_index2 = Math.round((d.parcel_T+110)*chosenScale.length/150);
			sine_tp.frequency.value = chosenScale[key_index2];
			saw_tp.frequency.value = chosenScale[key_index2];

	  		
	  		if(Math.round(d.parcel_T) <= Math.round(d.temperature)){
	  			volume2.gain.value = 0.2;
	  			volume3.gain.value = 0;
	  		} else {
	  			volume3.gain.value = 0.1;
	  			volume2.gain.value = 0;
	  		}
	  	} else if(ss==1 && sel=='Tp'){
	  		focus2b.attr("transform", "translate(" + (x(d.parcel_T) + (y(basep)-y(d.pressure))/tan)+ "," + y(d.pressure) + ")");
	  		focus2b.select("text").text(unit(Math.round(d.parcel_T)));
	  		focus2b.style("display", d.parcel_T < d.temperature ? "none" : null);
// 	  		sine_tp.frequency.value = 55*Math.pow(2,(((d.parcel_T-d.temperature)+90)/26));
// 	  		saw_tp.frequency.value = 55*Math.pow(2,((d.parcel_T+90)/26));

			key_index2 = Math.round(((d.parcel_T-d.temperature)+100)*chosenScale.length/140);
			sine_tp.frequency.value = chosenScale[key_index2];
			saw_tp.frequency.value = chosenScale[key_index2];
			
	  		if(Math.round(d.parcel_T) <= Math.round(d.temperature)){
	  			volume1.gain.value = 0.2;
	  			volume3.gain.value = 0;
	  		} else if (d.parcel_T > d.temperature) {
	  			volume3.gain.value = 0.1;
	  			volume1.gain.value = 0;
	  			}
// 	  		volume1.gain.value = d.parcel_T > d.temperature ? (d.parcel_T-d.temperature)/12 : 0;
// 	  		volume1.gain.exponentialRampToValueAtTime(d.parcel_T > d.temperature ? (d.parcel_T-d.temperature)/12 : 0, audioCtx.currentTime + 0.01);
	  	} else if(ss==1 && sel=='speed'){
// 	  		sine_speed.frequency.value = 50+55*Math.pow(2,(d.speed/30));

			key_index = Math.round((d.speed)*chosenScale.length/200);
			sine_speed.frequency.value = chosenScale[key_index];

	  	} else if(ss==1 && sel=='dir'){
// 	  		sine_U.frequency.value = 55*Math.pow(2,(d.u_wind/13));
// 	  		sine_V.frequency.value = 55*10*Math.pow(2,(d.v_wind/V_max));

			key_index = Math.round((d.v_wind)*chosenScale.length/200);
			sine_V.frequency.value = chosenScale[key_index];

	  		right_pan.setPosition((d.u_wind/U_max), 0, 0);
	  	} 


      focus.attr("transform", "translate(" + (x(d.temperature) + (y(basep)-y(d.pressure))/tan)+ "," + y(d.pressure) + ")");
      focus2.attr("transform", "translate(" + (x(d.dewpoint) + (y(basep)-y(d.pressure))/tan)+ "," + y(d.pressure) + ")");
      // if dewpoint focus text interferes with height text (is less than 100), 
      // 	then make text label on right side of circle
      if ((x(d.dewpoint) + (y(basep)-y(d.pressure))/tan) < 100) { 
      	focus2.select("text").attr("x", 9).attr("text-anchor", "start") 
      } else { 
      	focus2.select("text").attr("x", -9).attr("text-anchor", "end")
      };
    // if dewpoint rises above temperature, do not display (backend way around displaying missing dwpt data as 0)  
    if ((x(d.dewpoint)) > (x(d.temperature))) {
      	focus2.style("display", "none");
      } else {
      	focus2.style("display", null);
      }

	  var hodoConst = hodoLen/650;
      hodopt = hodogroup.select("path").node().getPointAtLength(hodoLen-y1*hodoConst);
      focus3b.attr("transform", "translate(" + (hodopt.x) + "," + (hodopt.y) + ")");
      focus3.attr("transform", "translate(0," + y(d.pressure) + ")");
            
      focus.select("text").text(unit(d.temperature));
      focus2.select("text").text(unit(d.dewpoint));
      focus3.select("text").text("--"+(Math.round(d.height/100)/10)+"km");
      focus4.select("text").text("Speed: " + wnd_unit(d.speed));
      focus5.select("text").text("Direction: " + (Math.round(d.direction)) + String.fromCharCode(176));
      focus6.select("text").text("Cardinal Direction: " + cardinal(d.direction));
      focus7.select("text").text("Dewpoint Depression: " + Math.round((parseFloat(unit(d.temperature))-parseFloat(unit(d.dewpoint)))*10)/10+unit(d.temperature).slice(-2));
      focus17.select("text").text("Tp - T: " + Math.round((parseFloat(unit(d.parcel_T))-parseFloat(unit(d.temperature)))*10)/10+unit(d.temperature).slice(-2));
	  focus16.select("text").text(PWAT == "nan " || PWAT == undefined ? "PWAT: --" : "PWAT: " + pwat_unit(PWAT));

      function cardinal(dir) {
      var card = '';
      if((348.75 <= dir) || (dir < 11.25)){
      	card = 'N'
      	} else if(11.25 <= dir && dir < 33.75) {
      	card = 'NNE'
      	} else if(33.75<= dir && dir < 56.25) {
      	card = 'NE'
      	} else if(56.25<= dir && dir < 78.75) {
      	card = 'ENE'
      	} else if(78.75<= dir && dir < 101.25) {
      	card = 'E'
      	} else if(101.25<= dir && dir < 123.75) {
      	card = 'ESE'
      	} else if(123.75<= dir && dir < 146.25) {
      	card = 'SE'
      	} else if(146.25<= dir && dir < 168.75) {
      	card = 'SSE'
      	} else if(168.75<= dir && dir < 191.25) {
      	card = 'S'
      	} else if(191.25<= dir && dir < 213.75) {
      	card = 'SSW'
      	} else if(213.75<= dir && dir < 236.25) {
      	card = 'SW'
      	} else if(236.25<= dir && dir < 258.75) {
      	card = 'WSW'
      	} else if(258.75<= dir && dir < 281.25) {
      	card = 'W'
      	} else if(281.25<= dir && dir < 303.75) {
      	card = 'WNW'
      	} else if(303.75<= dir && dir < 326.25) {
      	card = 'NW'
      	} else if(326.25<= dir && dir < 348.75) {
      	card = 'NNW'
      	}
      	return(card);
      }

  }
}
	
//Draw all background axes, grids, labels
function drawBackground(callback) {

var svghodo = d3.select("div#hodobox svg g").append("g").attr("class", "hodobg");
var svg = d3.select(".skewt_g").append("g").attr("class", "skewtbg");

var dryline = d3.svg.line()
    .interpolate("linear")
    .x(function(d,i) { return x( ( 273.15 + d ) / Math.pow( (1000/pp[i]), 0.286) - 273.15) + (y(basep)-y(pp[i]))/tan;})
    .y(function(d,i) { return y(pp[i])} );

var moistline = d3.svg.line()
	.interpolate("linear")
	.x(function(d,i) { return x( (273.15 + d - ( 3 * mixratio_from_temp(d, pp[i])/1000 )) / Math.pow( (1000/pp[i]), 0.286) - 273.15  ) + (y(basep)-y(pp[i]))/tan;})
	.y(function(d,i) { return y(pp[i])} );

var mixingline = d3.svg.line()
	.interpolate("linear")
	.x(function(d,i) { return x( temp_from_mixratio(d, pp[i]) ) + (y(basep)-y(pp[i]))/tan; })
	.y(function(d,i) { return y(pp[i]) } );

// Add clipping path
  svg.append("clipPath")
    .attr("id", "clipper")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    
// Skewed temperature lines
  svg.selectAll("gline")
    .data(d3.range(-100,45,10))
   .enter().append("line")
     .attr("x1", function(d) { return x(d)-0.5 + (y(basep)-y(100))/tan; })
     .attr("x2", function(d) { return x(d)-0.5; })
     .attr("y1", 0)
     .attr("y2", h)
     .attr("stroke", function(d) { if (d == 0) {return "blue"; } else { return "black"}})
     .attr("class", function(d) { if (d == 0) { return "tempzero"; } else { return "gridline"}})
     .attr("clip-path", "url(#clipper)");
     
// Logarithmic pressure lines
 	svg.selectAll("gline2")
    	.data(plines)
   	.enter().append("line")
     	.attr("x1", 0)
     	.attr("x2", w)
     	.attr("y1", function(d) { return y(d); })
     	.attr("y2", function(d) { return y(d); })
     	.attr("class", "gridline");
     
// Create array to plot dry adiabats
var pp = d3.range(topp,basep+1,10); //This is the range of pressures
var dryad = d3.range(-40,240,20); //These are temps in deg C
var all = [];
for (i=0; i<dryad.length; i++) { 
    var z = [];
    for (j=0; j<pp.length; j++) { z.push(dryad[i]); }
    all.push(z);
}

// Create array to plot moist adiabats
var moistad = d3.range(-80,220,20);
var all2 = [];
for (i=0; i<moistad.length; i++) {
	var z2=[];
	for (j=0; j<pp.length; j++){ z2.push(moistad[i]); }
	all2.push(z2);
}

// Create array to plot mixing ratio lines
var mixers = [0.1, 0.2, 0.6, 1.0, 2.0, 3.0, 5.0, 10.0, 20.0, 40.0]
var all3 = [];
for (i=0; i<mixers.length; i++) {
	var z3=[];
	for (j=0; j<pp.length; j++){
		z3.push(mixers[i]);
	}
	all3.push(z3);
}

// Draw dry adiabats
svg.selectAll(".dryline")
    .data(all)
.enter().append("path")
    .attr("class", "dryline")
    .attr("clip-path", "url(#clipper)")
    .attr("d", dryline)
    .style("display",null)
    .attr("stroke","black")
    .attr("fill", "none");

//     FIX THIS!!  Is drawing dry adiabats for some reason
// // Draw moist adiabats
// svg.selectAll(".moistline")
//     .data(all2)
// .enter().append("path")
//     .attr("class", "moistLine")
//     .attr("clip-path", "url(#clipper)")
//     .attr("d", moistline)
//     .attr("stroke","black")
//     .attr("stroke-dasharray", "3")
//     .attr("fill", "none")
//     .style("display",null);
    
// Draw mixing ratio lines
svg.selectAll(".mixline")
    .data(all3)
.enter().append("path")
    .attr("class", "mixLine")
    .attr("clip-path", "url(#clipper)")
    .attr("d", mixingline)
    .attr("stroke","purple")
    .attr("stroke-dasharray", "3")
    .attr("fill", "none");
    
// Line along right edge of plot
  svg.append("line")
     .attr("x1", w-0.5)
     .attr("x2", w-0.5)
     .attr("y1", 0)
     .attr("y2", h)
     .attr("stroke","black")
     .attr("fill","none")
     .attr("class", "gridline");
    
// Draw hodograph background
   svghodo.selectAll(".circles")
       .data(d3.range(10,80,10))
    .enter().append("circle")
       .attr("cx", 0)
       .attr("cy", 0)
       .attr("r", function(d) { return r(d); })
       .attr("class", "gridline")
       .attr("stroke", "black")
       .attr("fill", "none");
    svghodo.selectAll("hodolabels")
	  .data(d3.range(10,80,20)).enter().append("text")
	    .attr('x', 0)
        .attr('y', function (d) { return r(d); })
        .attr('dy', '0.0em')
    	.attr('class', 'hodolabels')
    	.attr('text-anchor', 'middle')
    	.attr('font-size','10px')
    	.text(function(d) { return d+'kts'; });
    svghodo.append("line")
    	.attr("x1", 0)
    	.attr("x2", 0)
    	.attr("y1", -300)
     	.attr("y2", 300)
     	.attr("stroke","black")
     	.attr("fill","none")
     	.attr("class", "hodoAxisV");
	svghodo.append("line")
    	.attr("x1", -300)
    	.attr("x2", 300)
    	.attr("y1", 0)
     	.attr("y2", 0)
     	.attr("stroke","black")
     	.attr("fill","none")
     	.attr("class", "hodoAxisU");
     	
// Add axes
    svg.append("g")
    	.attr("class", "x axis")
    	.attr("stroke","black")
    	.attr("transform", "translate(0," + (h-0.5) + ")").call(xAxis);

    svg.append("g")
    	.attr("class", "y axis")
    	.attr("stroke","black")
    	.attr("transform", "translate(-0.5,0)").call(yAxis);

// Add mixing ratio labels (top x axis)
var mixingLabelsX = svg.append("g")
    	.attr("class", "mixingRatioLabelsX axis")
    	.attr("stroke","none")
    	.attr("transform", "translate(0, 0.5)");

// Can't get mixing ratio labels to bind to lines so manually entering positions...
// Mixing ratio labels for top of graph
var mixTickLocs = [355, 385, 440, 475, 520, 545, 580];

mixingLabelsX.selectAll(".mixText")
	.data(mixers.slice(0,7))
.enter().append("text")
	.text(function(d){ return d})
	.attr("class","mixtext")
	.attr("transform", function(d,i){ return "translate("+mixTickLocs[i]+",-5)" });
	
// Add right y axis mixing ratio labels
var mixingLabelsY = svg.append("g")
    	.attr("class", "mixingRatioLabelsY axis")
    	.attr("stroke","none")
    	.attr("transform", "translate(0, 0.5)");
// Mixing ratio labels for right of graph
var mixTickLocs2 = [55, 200, 380];
mixingLabelsY.selectAll(".mixText2")
	.data(mixers.slice(7))
.enter().append("text")
	.text(function(d){ return d})
	.attr("class","mixtext")
	.attr("transform", function(d,i){ return "translate("+(2.5+w)+","+mixTickLocs2[i]+")" });





if(callback) callback(true);
}


function keyboardsPopulate(){
	var f=0;
	
	// Populate all arrays with full keyboard (minus outer two octaves)
	for (i=13; i<89; i++){
		f = 440 * Math.pow(2, (i-49)/12);
		keyboard.push(f);
	}

	// Octave iteration version:
	for(k=0; k<6; k++){
		j=k*12
		//added 3 to diatonic to transpose to C major instead of A major
		diatonic.push(keyboard[j+3]);
		diatonic.push(keyboard[j+5]);
		diatonic.push(keyboard[j+7]);
		diatonic.push(keyboard[j+8]);
		diatonic.push(keyboard[j+10]);
		diatonic.push(keyboard[j+12]);
		diatonic.push(keyboard[j+14]);
		
		whole_tone.push(keyboard[j]);
		whole_tone.push(keyboard[j+2]);
		whole_tone.push(keyboard[j+4]);
		whole_tone.push(keyboard[j+6]);
		whole_tone.push(keyboard[j+8]);
		whole_tone.push(keyboard[j+10]);
		
		diminished1.push(keyboard[j]);
		diminished1.push(keyboard[j+1]);
		diminished1.push(keyboard[j+3]);
		diminished1.push(keyboard[j+4]);
		diminished1.push(keyboard[j+6]);
		diminished1.push(keyboard[j+7]);
		diminished1.push(keyboard[j+9]);
		diminished1.push(keyboard[j+10]);
		
		diminished2.push(keyboard[j]);
		diminished2.push(keyboard[j+2]);
		diminished2.push(keyboard[j+3]);
		diminished2.push(keyboard[j+5]);
		diminished2.push(keyboard[j+6]);
		diminished2.push(keyboard[j+8]);
		diminished2.push(keyboard[j+9]);
		diminished2.push(keyboard[j+11]);	
	}
}
function toC(tem){
	temp = Math.round(tem*10)/10 +"Â°C";
	return temp;
}
function toF(tem){
	tempF = (tem*9/5)+32;
	temp = Math.round(tempF*10)/10 +"Â°F";
	return temp;
}   
function toMS(spd){
	ms = Math.round(spd*10/1.944)/10 + "m/s";
	return ms;
}
function toMPH(spd){
	mph = Math.round(spd*10*2.237)/10 + "mph";
	return mph;
}
function toKT(spd){
	kts = spd + "kts";
	return kts;
}
function toIN(pwat){
	inch = Math.round(100*pwat/25.4)/100 + "in";
	return inch;
}
function toMM(pwat){
	mm = Math.round(10*pwat)/10 + "mm";
	return mm;
}
