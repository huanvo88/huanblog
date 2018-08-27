// HandoutBrowser.js; see
//   http://katlas.math.toronto.edu/drorbn/?title=HandoutBrowser.js
// (c) Copyleft Dror Bar-Natan, 2007-2009. See
//   http://www.math.toronto.edu/~drorbn/Copyleft/index.html
// Double buffering by Scott Morrison.

var text_level = 2;
var alt_text_level = 1;
var rate = 30;				// Glide refresh rate.
var ticks_per_glide = rate;
var tl = 0;				// ticks left for current glide.
var winW = 1024, winH = 740;
var viewX0, viewX1, viewY0, viewY1;
var fromX0, fromX1, fromY0, fromY1;
var mx, my, nx, ny;			// Handout coordinates to window pixels
					// linear conversion coeffs.
var toX0, toX1, toY0, toY1;		// Target of current glide.
var menu, menu_text, menu_div;
var slide_0, slide_div_0, slide_1, slide_div_1;
var slide_div_2;
var slide_order = 0;
var visible_slide, hidden_slide;
var visible_slide_div, hidden_slide_div;
var slideW, slideH;
var help_div, timer_span, beginner_div, text_div;
var info_span;
var mouse_start, mouse_now, slide_start;
var k, n;
var mode="normal";
var rectangle_div;
var logging = false;
var logging_start;
var log = [];
var log_html, log_text;

var browser="Mozilla";
if (parseInt(navigator.appVersion)>3 && navigator.appName.indexOf("Microsoft")!=-1) browser="IE";

var glide_mode, gm;
if (glide_mode == undefined) glide_mode = "linear";
gm = glide_mode;

var lower_resolution_while_gliding;
if (lower_resolution_while_gliding == undefined) {
  lower_resolution_while_gliding = true;
}

var enable_double_buffering;
if (enable_double_buffering == undefined) {
  enable_double_buffering = true;
}

var slide_set;
var image_set=[];
if (slide_set != undefined) {
  image_set.length=slide_set.length;
  for (i=0; i<slide_set.length; ++i) {
    image_set[i] = new Image();
    image_set[i].src = slide_set[i];
  }
}

var maxX, maxY, step;

var linksmap, linksmap_map;

var views, lastview;

function load_views() {
  if (views == undefined || views.length == 0) {
    views = [];
    views[0] = [0, 0, maxX, maxY, "All"];
  } else {
    lastview = views.length-1;
    for (i=1; i<views.length; ++i) if (views[i][4] == "----") lastview=i-1;
  }
  n=views.length; 
}

function load_links() {
  if (views.length-lastview > 2) {
    linksmap="";
    for (i=lastview+2; i<views.length; ++i) {
      linksmap += "  <area shape=\"rect\" coords=\"";
      linksmap += mx*views[i][0]+",";
      linksmap += my*views[i][1]+",";
      linksmap += mx*views[i][2]+",";
      linksmap += my*views[i][3];
      linksmap += "\" href=\"javascript:Go('" + views[i][4] + "')\">\n";
    }
    linksmap_map.innerHTML = linksmap;
  }
}

function getCookie(c_name) {
  if (document.cookie.length>0) {
    try {
        c_start=document.cookie.indexOf(c_name + "=")
    } catch(error) {
        return ""
    }
    if (c_start!=-1) {
      c_start=c_start + c_name.length+1
      c_end=document.cookie.indexOf(";",c_start)
      if (c_end==-1) c_end=document.cookie.length
      return unescape(document.cookie.substring(c_start,c_end))
    }
  }
  return ""
}

function loaded() {
  if (maxX == undefined || maxY == undefined) {
    maxX = image_set[0].width;
    maxY = image_set[0].height;
  }
  load_views();
  cookie_log = getCookie("log");
  if (cookie_log != "") {
    log = eval(cookie_log);
    logging_start = new Date(log[0]);
  } else {
    document.cookie = "log=[]";
  }
  if (browser == "IE") {
    winW = document.body.offsetWidth; winH = document.body.offsetHeight;
  } else {
    winW = window.innerWidth; winH = window.innerHeight;
  }
  text_div = document.getElementById("text_div");
  slide_0 = document.getElementById("slide_0");
  slide_1 = document.getElementById("slide_1");
  slideW=slide_0.width; slideH=slide_0.height;
  if (step == undefined) step = 1;
  if (isNaN(maxX)) maxX=slideW; if (isNaN(maxY)) maxY=slideH;
  if (isNaN(step)) step = 1;
  slide_div_0 = document.getElementById("slide_div_0");
  slide_div_1 = document.getElementById("slide_div_1");
  set_slide_order(0);
  rectangle_div = document.getElementById("rectangle_div");
  help_div = document.getElementById("help_div");
  help_div.innerHTML="\
    <span id=\"timer_span\" style=\"background-color:yellow\"></span>\
    <span id=\"beginner_div\" style=\"background-color:yellow\">\
    Best viewed at full screen (<font color=red>F11</font>)<br>\
    <a href=\"javascript: keyaction('t');\">cycle <font color=red>t</font>ext level</a><br>\
    <a href=\"javascript: keyaction('n');\"><font color=red>n</font>ext</a> / <a href=\"javascript: keyaction('p');\"><font color=red>p</font>revious</a> view<br>\
    <a href=\"javascript: keyaction('[');\"><font color=red>[</font>out</a> / <a href=\"javascript: keyaction(']');\">in<font color=red>]</font></a> zoom<br>\
    <a href=\"javascript: keyaction('h');\"><font color=red>h</font>andout only</a><br></span>\
    <span id=\"intermediate_help\" style=\"display: none; background-color:yellow;\">\
    <a href=\"javascript: keyaction('g');\"><font color=red>g</font>liding on/off</a><br>\
    move view <a href=\"javascript: keyaction('q');\">before (<font color=red>q</font>)</a> / <a href=\"javascript: keyaction('a');\"><font color=red>a</font>fter</a><br>\
    <a href=\"javascript: keyaction('d');\"><font color=red>d</font>uplicate</a> / e<a href=\"javascript: keyaction('x');\"><font color=red>x</font>punge</a> view<br>\
    <a href=\"javascript: keyaction('c');\"><font color=red>c</font>apture</a> / <a href=\"javascript: keyaction('r');\"><font color=red>r</font>ename view</a>\
  </span>"
  k=0;
  menu_div = document.getElementById("menu_div");
  info_span = document.getElementById("info_span");
  timer_span = document.getElementById("timer_span");
  linksmap_map = document.getElementById("linksmap_map");
  load_links();
  goto_view(0); tl=1;
  //set_view();
  set_textmode();
  setInterval("tick()", 1000/rate);
}

function set_slide_order(order) {
    if (order == 0) {
       slide_div_0.style.display = 'inline';
       slide_div_0.style.zIndex = 0;
       slide_div_1.style.zIndex = -1;
       slide_div_1.style.display = 'none';
       visible_slide = slide_0;
       hidden_slide = slide_1;
       visible_slide_div = slide_div_0;
       hidden_slide_div = slide_div_1;
    } else {
       slide_div_1.style.display = 'inline';
       slide_div_0.style.zIndex = -1;
       slide_div_1.style.zIndex = 0;
       slide_div_0.style.display = 'none';
       visible_slide = slide_1;
       hidden_slide = slide_0;
       visible_slide_div = slide_div_1;
       hidden_slide_div = slide_div_0;
    }
    if (!enable_double_buffering) {
      hidden_slide = visible_slide;
      hidden_slide_div = visible_slide_div;
    }
    text_div.style.zIndex = 1;
    slide_order = order;
}

function switch_slides() {
    set_slide_order(1 - slide_order);
}

function tick() {
  var m,l, r;
  var p1 = new Object();
  var p2 = new Object();
  var p3 = new Object();
  gm = glide_mode;
  if (tl>0) {
    switch (gm) {
      case "hyperbolic":
        if (toX0 == undefined) {
          r = (viewY1-viewY0)/(viewX1-viewX0);
        } else {
          r = (toY1-toY0)/(toX1-toX0);
        }
        p1.x=(viewX0+viewX1)/2; p1.y=(viewY0+viewY1)/2; p1.d=(viewX1-viewX0)/2;
        p2.x=(toX0+toX1)/2; p2.y=(toY0+toY1)/2; p2.d=(toX1-toX0)/2;
        hyperbolic_step(p1, p2, 1./tl, p3);
        viewX0 = p3.x - p3.d; viewX1 = p3.x + p3.d;
        viewY0 = p3.y - r*p3.d; viewY1 = p3.y + r*p3.d;
        break;
      default:
      case "linear":
      case "old_linear":
        viewX0 += (toX0-viewX0)/tl; viewX1 += (toX1-viewX1)/tl;
        viewY0 += (toY0-viewY0)/tl; viewY1 += (toY1-viewY1)/tl;
        break;
      case "logarithmic":
      case "old_logarithmic":
        m = ((tl-1)*(viewX0+viewX1) + (toX0+toX1))/(2.*tl);
        l = Math.pow(Math.pow(viewX1-viewX0, tl-1) * (toX1-toX0), 1./tl);
        viewX0 = m-l/2.; viewX1 = m+l/2.;
        m = ((tl-1)*(viewY0+viewY1) + (toY0+toY1))/(2.*tl);
        l = Math.pow(Math.pow(viewY1-viewY0, tl-1) * (toY1-toY0), 1./tl);
        viewY0 = m-l/2.; viewY1 = m+l/2.;
        break;
    }
    --tl;
    if (tl==0) {
      viewX0 = toX0; viewX1 = toX1; viewY0 = toY0; viewY1 = toY1;
    }
    set_view();
  } else {
    set_timer_span();
  }
}

// The computations in "hyperbolic_step" follow
// http://katlas.math.toronto.edu/drorbn/AcademicPensieve/2009-04
//   -> "The Formulas".
function hyperbolic_step(p1, p2, s, p3) {
  var x, y, d1, d2, norm, a, b, x1p, x0, r, x1pp, x2pp;
  var theta1, theta2, t1, t2, t3, theta3, x3pp, d3pp, x3p, d3p;
  with (Math) {
      x = p1.x-p2.x; y = p1.y-p2.y;
      d1 = p1.d; d2 = p2.d;
      norm = sqrt(x*x + y*y);
    if (norm < 0.000000001) {
      p3.x = p1.x; p3.y = p1.y;
      t1 = log(d1); t2 = log(d2);
      t3 = t1 + s*(t2-t1);
      p3.d = exp(t3);
    } else {
      a = x/norm; b = y/norm;
      x1p = a*x + b*y;
      x0 = (x1p + (d1*d1-d2*d2)/x1p)/2;
      r = sqrt((x1p-x0)*(x1p-x0)+d1*d1);
      x1pp = (x1p-x0)/r; x2pp = -x0/r;
      theta1 = acos(x1pp);
      theta2 = acos(x2pp);
      t1 = log(tan(theta1/2));
      t2 = log(tan(theta2/2));
      t3 = t1 + s*(t2-t1);
      theta3 = 2*atan(exp(t3));
      x3pp = cos(theta3);
      d3pp = sin(theta3);
      x3p = x0 + r*x3pp;
      p3.d = r*d3pp;
      p3.x = p2.x + a*x3p;
      p3.y = p2.y + b*x3p;
    }
  }
}

function resized() {
  if (browser == "IE") {
    winW = document.body.offsetWidth; winH = document.body.offsetHeight;
  } else {
    winW = window.innerWidth; winH = window.innerHeight;
  }
  set_view()
}

function set_view() {
  var w,h;
  mode = "normal";
  rectangle_div.style.display = "none";
  var scaleX = maxX*winW/slideW/(viewX1-viewX0);
  var scaleY = maxY*winH/slideH/(viewY1-viewY0);
  if (scaleY < scaleX) {		// View is vertically bound.
    	// y->my*y+ny maps viewY0->0 and viewY1->winH:
    my = winH/(viewY1-viewY0); ny = -viewY0*winH/(viewY1-viewY0);
    	// x->mx*x+nx preserves proportions and maps (viewX0+viewX1)/2->winW/2:
    mx = my/maxX*maxY*slideW/slideH; nx = winW/2-mx*(viewX0+viewX1)/2;
    h = maxY*winH/(viewY1-viewY0);
    if (h != hidden_slide.height) {hidden_slide.height=h}
    hidden_slide_div.style.top=-viewY0*slideH*scaleY/maxY;
    w = h*(slideW/slideH);
    if (w != hidden_slide.width) {hidden_slide.width=w}
    hidden_slide_div.style.left = winW/2-scaleY*slideW*(viewX0+viewX1)/2/maxX;
  } else {				// View is horizontally bound.
    	// x->mx*x+nx maps viewX0->0 and viewX1->winW:
    mx = winW/(viewX1-viewX0); nx = -viewX0*winW/(viewX1-viewX0);
    	// y->my*y+ny preserves proportions and maps (viewY0+viewY1)/2->winH/2:
    my = mx/maxY*maxX*slideH/slideW; ny = winH/2-my*(viewY0+viewY1)/2;
    w = maxX*winW/(viewX1-viewX0);
    if (w != hidden_slide.width) {hidden_slide.width=w}
    hidden_slide_div.style.left = -viewX0*slideW*scaleX/maxX;
    h = w*(slideH/slideW);
    if (h != hidden_slide.height) {hidden_slide.height=h}
    hidden_slide_div.style.top = winH/2-scaleX*slideH*(viewY0+viewY1)/2/maxY;
  }
  var best_i=0; var best_q=0;
  var q, iw;
  if (slide_set != undefined) {
    if (tl==0 || !lower_resolution_while_gliding) {
      for (i=0; i<slide_set.length; ++i) {
        iw = image_set[i].width;
        if (w<=iw) {q = w/iw} else {q = iw/w};
        if (q>best_q) {best_i = i; best_q = q};
      }
    } else {
      iw = image_set[0].width;
      if (w<=iw) {best_q = w/iw} else {best_q = iw/w};
      best_i = 0;
    }
    hidden_slide.src = image_set[best_i].src;
  }
  info_span.innerHTML = (
    '<br>Showing ' + slide_set[best_i] +
    ' on ' + browser +
    ' at ' + Math.round(w) + 'x' + Math.round(h) +
    ' in ' + winW + 'x' + winH +
    ' with q=' + Math.round(1000*best_q)/1000
      + '; tl=' + tl +
      '<br>viewX=['+viewX0+','+viewX1+']' +
      '<br>viewY=['+viewY0+','+viewY1+']' +
      '<br>toX=['+toX0+','+toX1+']' +
      '<br>toY=['+toY0+','+toY1+']'
      + '<br>visible_slide_div.style.top='+visible_slide_div.style.top
      + '<br>hidden_slide_div.style.top='+hidden_slide_div.style.top
  );
  if (enable_double_buffering) switch_slides();
  load_links();
}

function Go(url) {
  record([2, url]);
  window.open(url, "hb-popup",
    "width=800,height=600,resizable=yes,scrollbars=yes,status=no,location=yes"
  )
}

function set_visibility(id, level) {
  var el = document.getElementById(id);
  if (text_level >= level) el.style.display = 'inline';
  else el.style.display = 'none';
}

function set_textmode() {
  set_visibility("title_text", 1);
  set_visibility("help_div", 1);
  set_visibility("navigation_text", 2);
  set_visibility("HandoutBrowser_banner", 2);
  set_visibility("beginner_div", 2);
  set_visibility("intermediate_help", 3);
  set_visibility("menu_div", 3);
  set_visibility("info_span", 3);
}

function set_timer_span() {
  var k1 = k+1;
  if (k1==n || k1==lastview+1) k1=0;
  next_piece = views[k1][4];
  var timer = "";
  if (logging) {
    var now = new Date();
    var elapsed = (now.getTime()-logging_start.getTime())/1000;
    var h = Math.floor(elapsed/3600); elapsed -= 3600*h;
    var m = Math.floor(elapsed/60); elapsed -= 60*m;
    var s = Math.floor(elapsed);
    timer = " | " + (h>0 ? h+":" : "");
    timer += (m>=10 ? m : "0"+m) + ":" + (s>=10 ? s : "0"+s);
  }
  timer_span.innerHTML = "Next: "+next_piece+timer+"<br>";
}

function set_menu() {
  with (Math) {
    decimals = max(0,ceil(-log(step)/LN10-0.01));
  }
  menu_text = menu = "var views = [";
  menu += "&nbsp;&nbsp;&nbsp;// ";
  menu += "<a href=\"javascript:copy_menu();\">copy</a><br>\n";
  menu_text += "\n";
  document.viewform.viewselect.options.length=n;
  for (i=0; i<n; ++i) {
    var ot = "----";
    if (i<=lastview) ot = (i+1)+"/"+(1+lastview)+".  "+views[i][4];
    if (i>lastview+1) ot = (i-lastview-1)+"/"+(n-lastview-2)+".  "+views[i][4];
    document.viewform.viewselect.options[i] = new Option(ot);
    menu += "<a href=\"javascript: goto_view("+i+");\"";
    if (k==i) {menu += " style=\"background-color: pink;\"";}
    else {menu += " style=\"background-color: yellow;\"";}
    menu += ">["; menu_text += "  [";
    var l = views[i].length;
    for (j=0; j<l; ++j) {
      var v=views[i][j];
      if (isNaN(v)) {menu += "\""+v+"\""; menu_text += "\""+v+"\"";}
      else {menu += +v.toFixed(decimals); menu_text += +v.toFixed(decimals);}
      if (j<l-1) {menu += ", "; menu_text += ", ";}
    }
    menu += "]</a>"; menu_text += "]";
    if (i<n-1) {menu += ","; menu_text += ",";}
    menu += "<br>\n"; menu_text += "\n";
  }
  menu += "];"; menu_text += "];";
  document.viewform.viewselect.selectedIndex = k;
  menu_div.innerHTML = menu;
  set_timer_span();
}

function copy_menu() {copyToClipboard(menu_text);}

function show_log() {
  logging = false;
  log_html = "<span style=\"background-color: yellow; font-size:75%\">\n";
  log_html += "[" + log[0] + ",";
  log_html += "&nbsp;&nbsp;&nbsp;// ";
  log_html += "<a href=\"javascript:copy_log();\">copy</a>";
  log_html += "<br>\n";
  log_text = "[" + log[0] + ",\n";
  for (i=1; i<log.length; ++i) {
    if (log[i][1][0] == 1) {
      log_html += "[" + log[i][0] + ", [" + log[i][1].toString() + "], \"";
      log_text += "  [" + log[i][0] + ", [" + log[i][1].toString() + "], \"";
      log_html += "Handout view "+(log[i][1][1]+1)+": "+views[log[i][1][1]][4];
      log_text += "Handout view "+(log[i][1][1]+1)+": "+views[log[i][1][1]][4];
    }
    if (log[i][1][0] == 2) {
      log_html += "[" + log[i][0] + ", [2,\"" + log[i][1][1] + "\"], \"";
      log_text += "  [" + log[i][0] + ", [2,\"" + log[i][1][1] + "\"], \"";
      log_html += "Viewed &lt;a target=_blank href=\\\""+log[i][1][1]+"\\\"&gt;"+log[i][1][1]+"&lt;/a&gt;";
      log_text += "Viewed <a target=_blank href=\\\""+log[i][1][1]+"\\\">"+log[i][1][1]+"</a>";
    }
    log_html += "\"]";
    log_html += (i<log.length-1 ? "," : "") + "<br>\n";
    log_text += (i<log.length-1 ? "\"],\n" : "\"]\n");
  }
  log_html += "]\n";
  log_html += "</span>";
  log_text += "]";
  menu_div.innerHTML = log_html;
  menu_div.style.display = 'inline';
}

function clear_log() {
  log = [];
  document.cookie = "log=[]";
  show_log();
}

function copy_log() {
  copyToClipboard(log_text);
}

function viewselected() {
  goto_view(document.viewform.viewselect.selectedIndex);
}

// Logged events:
// [1, i]: sliding to view #i.
// [2, url]: popup at url.
function record(e) {
  if (logging) {
    var now = new Date();
    var diff = now.getTime()-logging_start.getTime();
    var l = log.length;
    if (e[0]==1) {
      if (l < 2 || log[l-1][1][0] != 1 || diff > log[l-1][0]+2000) {
        log[l] = [diff, e];
      } else {
        log[l-1] = [diff, e];
      }
    }
    if (e[0]==2) {
      log[l] = [diff, e];
    }
    var log_cookie = "log=[" + log[0] + ",";
    for (i=1; i<log.length; ++i) {
      if (log[i][1][0] == 1) {
        log_cookie += "[" + log[i][0] + ", [" + log[i][1].toString() + "]]";
      }
      if (log[i][1][0] == 2) {
        log_cookie += "[" + log[i][0] + ", [2,\"" + log[i][1][1] + "\"]]";
      }
      log_cookie += (i<log.length-1 ? "," : "");
    }
    log_cookie += "];";
    document.cookie = log_cookie;
  }
}

function goto_view(i) {
  record([1, i]);
  k=i;
  toX0=views[k][0]; toY0=views[k][1];
  toX1=views[k][2]; toY1=views[k][3];
  if (gm != "old_linear" && gm != "old_logarithmic") {
    var scaleX = maxX*winW/slideW/(toX1-toX0);
    var scaleY = maxY*winH/slideH/(toY1-toY0);
    var m,l;
    if (scaleY < scaleX) {		// View is vertically bound.
      m = (toX0+toX1)/2;
      l = (toX1-toX0)/2 * scaleX/scaleY;
      toX1 = m + l; toX0 = m-l;
    } else {				// View is horizontally bound.
      m = (toY0+toY1)/2;
      l = (toY1-toY0)/2 * scaleY/scaleX;
      toY1 = m + l; toY0 = m-l;
    }
  }
  set_menu();
  tl = ticks_per_glide;
}

function previous() {if (k>0) {--k} else {k=lastview}; goto_view(k);}

function next() {if (k != lastview && k < n-1) {++k} else {k=0}; goto_view(k);}

function rename() {
  var name = prompt("Rename current view", views[k][4]);
  if (name != null) {
    views[k][4] = name;
    load_views(); load_links();
    set_menu();
  }
}

function expunge() {
  if (n>0) {
    views.splice(k, 1);
    load_views(); load_links();
    if (k==n || k==lastview) --k;
    goto_view(k);
  }
}

function duplicate() {
  views.splice(k+1, 0, [
    views[k][0], views[k][1], views[k][2], views[k][3], views[k][4]
  ]);
  load_views(); load_links();
  set_menu();
}

function flip_with(j) {
  if (j>=0 && j<n) {
    var t=views[k];
    views[k] = views[j];
    views[j] = t;
    load_views(); load_links();
    goto_view(j);
  }
}

function toggle_gliding() {
  if (ticks_per_glide == 1) ticks_per_glide=rate; else {
    ticks_per_glide=1;
    if (tl>0) tl=1;
  }
}

function set_capture() {
  if (mode != "capture") {
    mode = "capture";
    rectangle_div.style.left = 0; rectangle_div.style.top = 0;
    rectangle_div.style.width = 250; rectangle_div.style.height = 60;
    rectangle_div.style.display = "block";
  } else {
    mode = "normal";
    rectangle_div.style.display = "none";
  }
}

function shift_view(nx, ny) {
  dx=(viewX1-viewX0)/100;
  dy=(viewY1-viewY0)/100;
  viewX0 += nx*dx; viewY0 += ny*dy;
  viewX1 += nx*dx; viewY1 += ny*dy;
  set_view();
}

function find_mouse(event) {
  var x, y;
  if (browser == "IE") {
    x = window.event.clientX + document.documentElement.scrollLeft
      + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop
      + document.body.scrollTop;
  } else {
    x = event.clientX + (window.scrollX || window.pageXOffset);
    y = event.clientY + (window.scrollY || window.pageYOffset);
  }
  return [x,y];
}

function drag_start(event) {
  var x, y;
  fromX0 = viewX0; fromX1 = viewX1;
  fromY0 = viewY0; fromY1 = viewY1;
  mouse_start = find_mouse(event);
  if (mode == "capture") {
    rectangle_div.style.left = mouse_start[0];
    rectangle_div.style.top = mouse_start[1];
  } else {
    x = parseInt(visible_slide_div.style.left, 10);
    if (isNaN(x)) x = 0;
    y = parseInt(visible_slide_div.style.top,  10);
    if (isNaN(y)) y = 0;
    slide_start = [x,y];
  }
  if (browser == "IE") {
    document.addEventListener("mousemove", drag, true);
    document.addEventListener("mouseup", drag_end, true);
    // document.attachEvent("onmousemove", drag);
    // document.attachEvent("onmouseup", drag_end);
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  } else {
    document.addEventListener("mousemove", drag, true);
    document.addEventListener("mouseup", drag_end, true);
    event.preventDefault();
  }
}

function drag(event) {
  mouse_now = find_mouse(event);
  if (mode == "capture") {
    rectangle_div.style.left = Math.min(mouse_start[0], mouse_now[0]);
    rectangle_div.style.width = Math.abs(mouse_now[0] - mouse_start[0]);
    rectangle_div.style.top = Math.min(mouse_start[1], mouse_now[1]);
    rectangle_div.style.height = Math.abs(mouse_now[1] - mouse_start[1]);
  } else {
    viewX0 = fromX0 - (mouse_now[0] - mouse_start[0])/mx;
    viewX1 = fromX1 - (mouse_now[0] - mouse_start[0])/mx;
    viewY0 = fromY0 - (mouse_now[1] - mouse_start[1])/my;
    viewY1 = fromY1 - (mouse_now[1] - mouse_start[1])/my;
    visible_slide_div.style.left =
      slide_start[0] + mouse_now[0] - mouse_start[0];
    visible_slide_div.style.top =
      slide_start[1] + mouse_now[1] - mouse_start[1];
  }
  if (browser == "IE") {
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  } else event.preventDefault();
}

function drag_end(event) {
  if (mode == "capture") {
    viewX0 = (Math.min(mouse_start[0],mouse_now[0])-nx)/mx;
    viewX1 = (Math.max(mouse_start[0],mouse_now[0])-nx)/mx;
    viewY0 = (Math.min(mouse_start[1],mouse_now[1])-ny)/my;
    viewY1 = (Math.max(mouse_start[1],mouse_now[1])-ny)/my;
    viewX0 = Math.round(viewX0/step)*step;
    viewY0 = Math.round(viewY0/step)*step;
    viewX1 = Math.round(viewX1/step)*step;
    viewY1 = Math.round(viewY1/step)*step;
    views.splice(k+1, 0, [viewX0, viewY0, viewX1, viewY1]); ++n;
    load_views(); load_links();
    rectangle_div.style.display = "none";
    goto_view(k+1);
  }
  if (browser == "IE") {
    document.detachEvent("onmousemove", drag);
    document.detachEvent("onmouseup", drag_end);
  } else {
    document.removeEventListener("mousemove", drag, true);
    document.removeEventListener("mouseup", drag_end, true);
  }
  set_view();
}

function swap_textmode() {
  if (!logging) {
    logging = true;
    if (log.length == 0) {
      logging_start = new Date();
      log = [logging_start.getTime()];
    }
  }
  var t=alt_text_level; alt_text_level=text_level; text_level=t;
  set_textmode();
}

function zoomin() {
  var dx=(viewX1-viewX0)/50; viewX0+=dx; viewX1-=dx;
  var dy=(viewY1-viewY0)/50; viewY0+=dy; viewY1-=dy;
  set_view();
}
function zoomout() {
  var dx=(viewX1-viewX0)/50; viewX0-=dx; viewX1+=dx;
  var dy=(viewY1-viewY0)/50; viewY0-=dy; viewY1+=dy;
  set_view();
}

function keypressed(e)
{
  var kn;
  if(window.event) { kn = e.keyCode } // IE
  else if(e.which) { // Netscape/Firefox/Opera
    kn = e.which;
    if (kn==33 || kn==34 || kn==37 || kn==38 || kn==39 || kn==40) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  var key = String.fromCharCode(kn);
  return keyaction(key);
}

function keyaction(key) {
  if (key == 'a') {flip_with(k+1);}
  if (key == 'B' || key == '.') {swap_textmode();}
  if (key == 'v') {clear_log();}
  if (key == 'l') {show_log();}
  if (key == 'c') {set_capture();}
  if (key == 'g') {toggle_gliding();}
  if (key == 'h') {document.location = visible_slide.src}
  if (key == 'n' || key == String.fromCharCode(34) || key == String.fromCharCode(39) || key == String.fromCharCode(40)) {next()}
  if (key == 'p' || key == String.fromCharCode(33) || key == String.fromCharCode(37) || key == String.fromCharCode(38)) {previous()}
  if (key == 'q') {flip_with(k-1);}
  if (key == 'r') {rename()}
  if (key == 't') {
    ++text_level; if (text_level >= 4) text_level=0;
    set_textmode()
  }
  if (key == 'x') {expunge();}
  if (key == 'd') {duplicate();}
  if (key == '0' || key == 'm') {
    toX0=0; toY0=0; toX1=maxX; toY1=maxY; tl=ticks_per_glide;
  }
  if (key == '1') {shift_view(-1,1);}
  if (key == '2') {shift_view(0,1);}
  if (key == '3') {shift_view(1,1);}
  if (key == '4') {shift_view(-1,0);}
  if (key == '5') {goto_view(k);}
  if (key == '6') {shift_view(1,0);}
  if (key == '7') {shift_view(-1,-1);}
  if (key == '8') {shift_view(0,-1);}
  if (key == '9') {shift_view(1,-1);}
  if (key == '+' || key == ']') {zoomin();}
  if (key == '-' || key == '[') {zoomout();}
}

function copyToClipboard(s) {
  if (window.clipboardData && clipboardData.setData) {
    clipboardData.setData("Text", s);
  } else {
      // You have to sign the code to enable this or allow the action in
      // about:config by changing
      // user_pref("signed.applets.codebase_principal_support", true);
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
    if (!clip) return 0;
      // create a transferable
    var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return 0;
      // specify the data we wish to handle. Plaintext in this case.
    trans.addDataFlavor('text/unicode');
      // To get the data from the transferable we need two new objects
    var str = new Object();
    var len = new Object();
    var str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);
    var copytext=meintext;
    str.data=copytext;
    trans.setTransferData("text/unicode",str,copytext.length*[[[[2]]]]);
    var clipid=Components.interfaces.nsIClipboard;
    if (!clip) return false;
    clip.setData(trans,null,clipid.kGlobalClipboard);
  }
}
