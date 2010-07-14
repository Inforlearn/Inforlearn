jQuery.fn.addHover = function() {
  return this.hover(function() {
    jQuery(this).addClass("hover")
  }, function() {
    jQuery(this).removeClass("hover")
  })
};
jQuery.fn.bubble = function(a, b) {
  var c = null, d = null, e = false;
  this.each(function() {
    this._title = this.title;
    this.removeAttribute("title")
  });
  this.hover(function() {
    if(!e) {
      $(document.body).append('<div id="status-bubble"><div></div></div>');
      c = $("div#status-bubble");
      d = c.find("div");
      e = true
    }
    var f = getOffset(this), g = $(this).find("div.bubble").html() || this._title.replace(",", "<br/>");
    d.html(g);
    h = c.get(0).offsetHeight;
    c.css({top:f[1] + a - h + 10 + "px", left:f[0] + b - 120 + "px", visibility:"visible"})
  }, function() {
    c.css("visibility", "hidden")
  })
};
jQuery.fn.location = function() {
  var a = this;
  $("a#set-location").click(function() {
    $(this).parent().hide();
    a.show();
    $("input#loc", a)[0].focus();
    return false
  })
};
var counter = {el:null, button:null, target:null, re:RegExp(/^\s*|\s*$/g), count:function() {
  var a = counter.el.value.replace(/\n/g, ""), b = a.length;
  chars_left = 256 - b;
  if(chars_left >= 0) {
    $(counter.target.parentNode).is(".overlimit") && $(counter.target.parentNode).removeClass("overlimit");
    str = chars_left > 1 ? "c\u00f2n " + chars_left + " k\u00fd t\u1ef1" : chars_left > 0 ? "c\u00f2n 1 k\u00fd t\u1ef1" : "v\u1eeba h\u1ebft s\u1ed1 k\u00fd t\u1ef1 cho ph\u00e9p"
  }else {
    $(counter.target.parentNode).is(".overlimit") || $(counter.target.parentNode).addClass("overlimit");
    str = chars_left < -1 ? "qu\u00e1 " + -chars_left + " k\u00fd t\u1ef1" : "qu\u00e1 1 k\u00fd t\u1ef1"
  }
  if((b > 0 && b < 257 && a.replace(counter.re, "") != counter.el._value) == true) {
    ob = $(".send-message-disable");
    ob.attr("onclick", "document.message_form.submit();");
    ob.attr("class", "send-message-enable")
  }
  counter.target.nodeValue = str
}};
jQuery.fn.presence = function() {
  var a = $("textarea#message", this), b = $(this).find("input[@type=submit]"), c = null;
  b.attr("disabled", true);
  this.icons();
  a.get(0)._value = a.attr("value");
  a.one("focus", function() {
    this.value = "";
    $(this).css({color:"#000"})
  });
  a.focus(function() {
    $(this).css({color:"#000"});
    counter.el = this;
    counter.button = b.get(0);
    counter.target = $("p#counter").get(0).firstChild;
    c = window.setInterval(counter.count, 500)
  });
  a.blur(function() {
    c && window.clearInterval(c)
  });
  this.submit(function() {
    if(b.attr("disabled")) {
      b.show();
      $("span.loader", this).hide();
      b.attr("disabled", true);
      return false
    }
    var d = $("input#loc");
    d.length > 0 && $("input#location").attr("value", d.attr("value"));
    if(window.location.search.indexOf("?page") != 0) {
      $.ajax({type:"POST", url:this.action, data:$("textarea, input, select", this).serialize(), success:function(e) {
        var f = document.createElement("div");
        f.innerHTML = e;
        e = $("li", f);
        e.css("display", "none");
        if(e.size() > 0) {
          if($("div#stream li.date:first").length) {
            $("div#stream li.date:first").after(e)
          }else {
            f = document.createElement("ul");
            f.className = "stream";
            $("div#stream p:first").remove();
            $("div#stream").prepend(f);
            $("div#stream ul").append(e)
          }
          e.toggle()
        }else {
          alert("Hmm. C\u00f3 m\u1ed9t s\u1ed1 th\u1ee9 \u0111\u00e3 ho\u1ea1t \u0111\u1ed9ng kh\u00f4ng \u0111\u00fang nh\u01b0 mong mu\u1ed1n :(")
        }
        b.show();
        $("span.loader", this).hide();
        b.attr("disabled", true)
      }});
      a.get(0)._value = a.attr("value");
      a.get(0).blur();
      a.css({color:"#ccc"});
      return false
    }
  })
};
jQuery.fn.spy = function() {
  var a = this;
  window.setInterval(function() {
    $.get(window.location.href, function(b) {
      a.find("ul").remove();
      a.append(b)
    })
  }, 3E4)
};
jQuery.fn.toggleable = function(a) {
  a = a;
  var b = this;
  $("a[@href=#" + this.attr("id") + "]").click(function() {
    if(b.css("display") == "none") {
      a && $(a).hide();
      b.show()
    }else {
      a && $(a).show();
      b.hide()
    }
  })
};
jQuery.fn.toggleSelection = function(a, b) {
  var c = $(a);
  this.click(function() {
    c.attr("checked", b ? true : false);
    return false
  })
};
jQuery.fn.icons = function() {
  var a = $("a#add-icons", this), b = null, c = null, d = this;
  a.toggle(function() {
    if(!b) {
      var e = ['<div id="form-icons">'];
      $("option", d).each(function() {
        if(this.value != "") {
          e.push('<label for="icon-' + this.value + '" title="' + this.title + '">');
          e.push('<img src="' + this.id + '" class="icon" alt="' + this.text + '" />');
          this.title != "" && e.push("<h4> " + this.title + " </h4>");
          e.push("</label>")
        }
      });
      e.push("</div>");
      d.append(e.join(""));
      b = $("div#form-icons");
      $("textarea#message").before('<img id="current-photo" class="icon"/>');
      c = $("img#current-photo").hide();
      c.click(function() {
        a.click()
      });
      $("label", b).click(function() {
        var f = $(this).attr("for").replace("icon-", ""), g = 0;
        $("select#icon>option").each(function(j) {
          if(this.value == f) {
            g = j
          }
        });
        $("select#icon").get(0).selectedIndex = g;
        $("label", b).removeClass("selected");
        $(this).addClass("selected");
        c.attr("src", $(this).find("img").get(0).src);
        c.css({display:"inline"});
        c.click();
        var i = $("textarea#message");
        i.css({width:"349px"});
        if(i.size() > 0) {
          d = i.get(0);
          if(d._first) {
            d.value = this.title;
            d._first = null
          }
          d.focus()
        }
      })
    }
    b.show();
    $(document.body).bind("click", function() {
      c.click()
    })
  }, function() {
    b.hide();
    $(document.body).unbind("click")
  })
};
jQuery.fn.avatars = function() {
  var a = this, b = $("img#current"), c = $("button[@type='submit']");
  $("label", a).click(function(d) {
    var e = $("img", this).attr("src");
    $("li", a).removeClass("selected");
    $(this).parent().addClass("selected");
    $(this).parent().find("input").get(0).checked = true;
    b.attr("src", e);
    c.attr("class", "active");
    d.preventDefault()
  })
};
jQuery.fn.backgrounds = function() {
  var a = this, b = $("input#background");
  $("label", a).click(function() {
    $("li", a).removeClass("selected");
    $(this).parent().addClass("selected");
    var c = $("input", this).attr("value");
    b.attr("value", c);
    b.attr("name", "background");
    b.attr("checked", "checked")
  })
};
jQuery.fn.ajaxify = function() {
  this.click(function() {
    var a = $(this).parent();
    a.html("vui l\u00f2ng ch\u1edd m\u1ed9t ch\u00fat...");
    $.ajax({type:"GET", url:this.href, success:function(b) {
      a.html(b)
    }});
    return false
  })
};
jQuery.fn.confirm = function() {
  this.click(function() {
    this.href += "&confirm=1";
    return window.confirm("B\u1ea1n ch\u1eafc ch\u1eafn mu\u1ed1n th\u1ef1c hi\u1ec7n thao t\u00e1c n\u00e0y?")
  })
};
jQuery.fn.setAccordion = function() {
  var a = this, b = a.find("li>a");
  a._current = null;
  b.click(function() {
    var c = this.hash.substring(1, this.hash.length);
    if(a._current == c) {
      $("div#" + a._current).removeClass("current");
      a.find("ul li").removeClass("current");
      a.removeClass("open");
      a._current = null;
      return false
    }else {
      a._current && $("div#" + a._current).removeClass("current")
    }
    $("div#" + c).addClass("current").find("input[@type='text'], input[@type='file'], textarea").get(0).focus();
    a.find("ul li").removeClass("current");
    $(this.parentNode).addClass("current");
    a._current = c;
    a.addClass("open");
    return false
  })
};
jQuery.fn.toggleCheckbox = function() {
  var a = $(this.form).find("input[@name=" + this.attr("name") + "]");
  this.click(function() {
    var b = this.checked;
    a.each(function() {
      this.checked = false
    });
    this.checked = b ? true : false
  })
};
jQuery.fn.poll = function(a) {
  var b = window.location.href;
  window.setInterval(function() {
    $.ajax({type:"GET", url:b, dataType:"json", success:function(c) {
      if(c.result) {
        if(a) {
          window.location.href = a
        }else {
          window.location.reload()
        }
      }
    }})
  }, 2500)
};
jQuery.fn.setTabs = function() {
  var a = this;
  a.find("li>a").click(function() {
    var b = this.hash.substring(1, this.hash.length);
    $("div#" + a._current).removeClass("current");
    $("div#" + b).addClass("current");
    a.find("ul li").removeClass("current");
    $(this.parentNode).addClass("current");
    a._current = b;
    return false
  });
  a._current = this.find("div.current").attr("id")
};
jQuery.fn.forms = function() {
  $("input[@type=submit]", this).parent().prepend("<span class='loader' title='\u0110ang g\u1eedi...'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Processing...</span>");
  this.bind("submit", function() {
    $("input[@type=submit]", this).hide();
    $("span.cancel", this).hide();
    $("span.loader", this).show()
  });
  this.each(function() {
    switch(this.id) {
      case "comment-form":
        $("#participant-nicks > a", this).each(function() {
          $(this).click(function() {
            var b = $(this).text(), c = $("#comment"), d = c.val(), e;
            c.focus();
            if(c.get(0).selectionStart == undefined) {
              e = document.selection.createRange();
              e = Array(e.start, e.end)
            }else {
              e = Array(c.get(0).selectionStart, c.get(0).selectionEnd)
            }
            e[0] === 0 ? c.val("@" + b + ": " + d.substring(e[1], d.length)) : c.val(d.substring(0, e[0]) + "@" + b + d.substring(e[1], d.length));
            return false
          })
        });
        $("#participant-nicks").show();
        break;
      case "loginform":
        $("input[@type=text]", this).get(0).focus();
        break;
      case "signup":
        $("input[@type=text]", this).get(0).focus();
        var a = $("input#password");
        a.parent().append('<div id="pwstatus"></div');
        a.bind("keyup", function() {
          analyseAccountPassword()
        });
        break;
      case "form-location":
        $(this).location();
        break;
      case "form-design":
        $(this).backgrounds();
        break;
      case "form-avatar":
        $("div.avatars", this).avatars();
        if($("a#toggle").size() > 0) {
          $("div.form-fields").hide();
          $("a#toggle").click(function() {
            $("div#account-form div.form-fields").show();
            $(this).hide();
            return false
          })
        }
        break
    }
    switch(this.parentNode.id) {
      case "form-message":
        $(this).presence();
        break
    }
  })
};
$(document).ready(function() {
  jQuery.browser.msie && $("ul#main-nav>li").addHover();
  var a = document.body, b = $(a).css("background-color");
  if(!(b == "#ffffff" || b == "rbg(255,255,255)")) {
    $("form").forms();
    b = $("div#sidebar");
    if(b.length) {
      b.find("div#contacts>ul>li").bubble(0, -18);
      b.find("div#channels>ul>li").bubble(0, -18)
    }
    $("a.confirm-delete").confirm();
    $("a.confirm-spam").confirm();
    $("a.ajaxify").ajaxify();
    $("div.tabs").setTabs();
    $("div.accordion").setTabs();
    $("form#change-number").toggleable("div#activation, div#activated");
    if(a.id == "welcome" || a.id == "contacts") {
      $("a#select-all").toggleSelection("input[@name='actor[]'], input[@name='email[]']", true);
      $("a#select-none").toggleSelection("input[@name='actor[]'], input[@name='email[]']", false)
    }
    a.id == "settings" && $("ul#badges").length && initBadges();
    $("input#only-channel, input#only-user").toggleCheckbox()
  }
});
if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(a, b) {
    if(b == null) {
      b = 0
    }else {
      if(b < 0) {
        b = Math.max(0, this.length + b)
      }
    }
    for(var c = b;c < this.length;c++) {
      if(this[c] === a) {
        return c
      }
    }
    return-1
  }
}
var pwMinLen = 6, pwOkLen = 8, pwCut = 10;
function passwordStrength(a, b) {
  var c = 0;
  if(a.length > 0) {
    if(a.length >= pwMinLen) {
      a = a.substr(0, pwCut);
      var d = a.toLowerCase();
      c = 1;
      for(var e = false, f = 0;f < b.length;f++) {
        if(d.indexOf(b[f].substr(0, pwCut).toLowerCase()) != -1) {
          e = true;
          break
        }
      }
      if(!e) {
        a.length >= pwOkLen && c++;
        a.toLowerCase() != a && a.toUpperCase() != a && c++;
        a.search(/[0-9]/) != -1 && a.search(/[A-Za-z]/) != -1 && c++;
        a.search(/[^0-9A-Za-z]/) != -1 && c++;
        if(c > 4) {
          c = 4
        }
      }
    }
  }else {
    c = -1
  }
  return c
}
function analyseAccountPassword(a) {
  var b = document.getElementById("password").value, c = document.getElementById("pwstatus");
  if(c || a) {
    ban = [];
    var d = document.getElementById("nick");
    d && d.value && ban.push(d.value);
    (d = document.getElementById("email")) && d.value && ban.push(d.value);
    (d = document.getElementById("full_name")) && d.value && ban.push(d.value);
    (d = document.getElementById("city")) && d.value && ban.push(d.value);
    b = passwordStrength(b, ban);
    c.style.backgroundPosition = "0px " + (-b * 20 - 20) + "px";
    if(a) {
      return b
    }
  }
}
function checkPassword(a) {
  if(a.length < 8) {
    return false
  }
  if(a.search(/[A-Z]/) == -1) {
    return false
  }
  if(a.search(/[a-z]/) == -1) {
    return false
  }
  if(a.search(/[0-9]/) == -1) {
    return false
  }
  return true
}
function getFieldValue(a) {
  if((a = document.getElementById(a)) && a.value) {
    return a.value
  }
  return""
}
function getOffset(a) {
  for(var b = 0, c = 0;a.offsetParent;) {
    b += a.offsetTop || 0;
    c += a.offsetLeft || 0;
    a = a.offsetParent
  }
  return[c, b]
}
$(function() {
  setTimeout(function() {
    $("#notice").fadeOut(300)
  }, 3E3)
});

$(document).ready(function(){   
    $(document.body).click(function (event) {
      if (
          (
            event.target.nodeName == "A" &&
            event.target.className != "send-message-disable" &&
            event.target.target != "_new" &&
            event.target.target != "_blank"
           ) || 
          
           (
             event.target.nodeName == "IMG" && 
             event.target.className == "photo"
           ) || 
           (
             event.target.type == "submit" && 
             event.target.name != "submit-location"
           ) || 
             event.target.nodeName == "SPAN"
           )  
        { $(document.body).fadeOut(200) }
      })
  })