/* Hello World */

// 기본 변수 정의
var appSuffix = "/?action=Plugin&type=IconView";
var resPrefix = "/?action=PluginResource&type=IconView&file=";

// 페이지 선택 및 키보드 입력 제한
//$("body *").attr("unselectable", "on");
$("html").on("keydown", function(event)
{
	var e  = event || window.event;
	var ek = event.keyCode || event.which;
	var whiteList = /^(27|33|34|35|36|37|38|40|39|100|102|116|122)$/;

	if(!whiteList.test(ek)) { return false };
});

// 컨텍스트 메뉴

$(function()
{
	var noah_cMenuObj = document.getElementById("XCmenu");

	$(document).on("contextmenu", function(event)
	{
		if(!$("#ivWrap").is(":visible"))
		{
			var e  = event || window.event;
			var el = e.target || e.srcElement;
			var sc = document.getElementById("selectAll-C");

			var tX = $(document).width() < e.pageX+$(noah_cMenuObj).width() ? e.pageX-($(noah_cMenuObj).width()+20) : e.pageX;
			var tY = $(window).scrollTop()+$(window).height() < e.pageY+$(noah_cMenuObj).height() ? e.pageY-($(noah_cMenuObj).height()+1) : e.pageY;

			sc.innerHTML = $("#selectAll-T").html();
			sc.onclick = ToggleSelectAll;

			if(/^(box|chkdiv|chkbox|urlimg|imgdiv|img|namediv)#/i.test(el.id))
			{
				try
				{
					var elnk = el.id.substr(el.id.indexOf("#")+1, el.id.length);

					selectToggle = "Y";
					ToggleSelectAll();
					ToggleCheckbox(elnk, "N");

					if(el.id.indexOf("/") == -1)
					{
						sc.innerHTML = "<b>Open</b>";
						sc.onclick = function() { onLink(event, "OpenAs", elnk); };
					}
				}
				catch(e) {}
			}

			$(noah_cMenuObj).css({ "left":parseInt(tX)+"px", "top":parseInt(tY)+"px" }).show();
		}

		$(document).on("mousewheel.disableScroll DOMMouseScroll.disableScroll touchmove.disableScroll", function(event)
		{
			var e = event || window.event;

			e.preventDefault();
			return;
		});

		$(document).keydown(function(event)
		{
			var e  = event || window.event;
			var el = e.target || e.srcElement;

			if($(el).parents("#XCmenu").length !== 0) return;

			$(noah_cMenuObj).hide();
			$(document).off("mousedown .disableScroll");
		});

		$(document).mousedown(function(event)
		{
			var e  = event || window.event;
			var el = e.target || e.srcElement;

			if($(el).parents("#XCmenu").length !== 0) return;

			$(noah_cMenuObj).hide();
			$(document).off("mousedown .disableScroll");
		});

		return false;
	});

	$(noah_cMenuObj).find(".item").mouseover(function(event)
	{
		var $el = $(this);
		if(!$el.hasClass("hover")) $el.addClass("hover");
	}).mouseout(function(event)
	{
		var $el = $(this);
		if($el.hasClass("hover")) $el.removeClass("hover");
	});

	$(noah_cMenuObj).find("li").click(function(event)
	{
		$(noah_cMenuObj).hide();
		$(document).off("mousedown .disableScroll");
	});
}); 

// 메인 목록
function write_listMain()
{
	var copiedDA = dirArray;
	var copiedFA = fileArray;

	var dirSuffix = appSuffix.replace("/", "");
	var stringBuf = "";

	// 디렉터리
	copiedDA.sort(function(A, B) { return A[0].toLowerCase().localeCompare(B[0].toLowerCase()); });

	for(var i=0, len=dirCount; i<len; i++)
	{
		copiedDA[i][0] = copiedDA[i][0].replace("'", "&#39;");

		if(copiedDA[i][0] == ".." || copiedDA[i][0].toLowerCase() == "$recycle.bin" || copiedDA[i][0].toLowerCase() == "system volume information") continue;

		stringBuf +=
		"<div id='box#" + copiedDA[i][1] + "' class='img_box' title='" + copiedDA[i][0] + "' onmouseover='ToggleCheckbox(\"" + copiedDA[i][1] + "\");' onmouseout='ToggleCheckbox(\"" + copiedDA[i][1] + "\");' onclick='onLink(event,\"Folder\",\"" + copiedDA[i][1] + dirSuffix + "\");'>" +
		" <div id='highlight#" + copiedDA[i][1] + "' class='img_highlight'>" +
		"	<div id='chkdiv#" + copiedDA[i][1] + "' class='img_chk'>" +
		"		<input type='checkbox' id='chkbox#" + copiedDA[i][1] + "' name='chkbox[]' value='" + copiedDA[i][1] + "' onclick='HighlightRow(\"" + copiedDA[i][1] + "\",this.checked);' />" +
		"		<a href='" + copiedDA[i][1] + "' onclick='return copy_fileAddress(this.href);'><img id='urlimg#" + copiedDA[i][1] + "' name='urlimg[]' src='" + resPrefix + "lnk_folder.png' alt='Directory' /></a>" +
		"	</div>" +
		"	<div id='imgdiv#" + copiedDA[i][1] + "' class='img_div'><img id='img#" + copiedDA[i][1] + "' src='" + resPrefix + "ico_folder.png' alt=''></div>" +
		"	<div id='namediv#" + copiedDA[i][1] + "' class='img_name text-cut'>" + copiedDA[i][0] + "</div>  </div>" +
		"</div></h1>\n";
	}

	// 파일
	copiedFA.sort(function(A, B) { return A[0].toLowerCase().localeCompare(B[0].toLowerCase()); });

	var imgf = /\.(bmp|gif|jpe|jpg|jpeg|png)$/i;
	var vidf = /\.(3g2|3gp|3gp2|3gpp|asf|avi|divx|flv|k3g|m1v|m2t|m2ts|m2v|m4v|mkv|mov|mp2v|mp4|mpv2|mpg|mpeg|ogm|ogv|qt|rmvb|tp|ts|webm|wm|wmv)$/i;
	var audf = /\.(aac|aif|aifc|aiff|au|cda|fla|flac|kar|m4a|mid|midi|mka|mp1|mp2|mp3|mpa|mpc|oga|ogg|opus|snd|wav|wave|wma|wv)$/i;
	var txtf = /\.(txt|doc|rtf|cfg|conf|config|log|inf|ini)$/i;
	var exef = /\.(exe|msi|msu|msp)$/i;
	var isof = /\.(b5t|bin|bwt|cdi|img|iso|isz|lcd|mds|nrg|pdi|vcd)$/i;
	var zipf = /\.(7z|ace|alz|arc|arj|b64|bh|bhx|bz|bz2|cab|ear|egg|enc|gz|ha|hqx|ice|lha|lzh|mim|pak|rar|tar|tbz|tbz2|tgz|uu|uue|war|xxe|z|zip|zoo)$/i;
	var caption = "";
	
	for(var i=0, len=fileCount; i<len; i++)
	{
		caption = "";
		var str_arr = [resPrefix + "ico_file.png", " onclick='onLink(event,\"Other\",\"" + copiedFA[i][1] + "\");'", ""];
		copiedFA[i][0] = copiedFA[i][0].replace("'", "&#39;");

		if(/^(pagefile\.sys|hiberfil\.sys|swapfile\.sys|desktop\.ini|thumbs\.db)$/i.test(copiedFA[i][0])) continue;

		if(imgf.test(copiedFA[i][0]))
		{
			var listImg_Src = (noah_useThumb == 1) ? copiedFA[i][1] : resPrefix + "ico_image.png";

			noah_imgList.push(copiedFA[i][1]);
			str_arr = [
				listImg_Src,
				" onclick='onLink(event,\"IMG\",\"" + copiedFA[i][1] + "\");'",
				" style='color:#00f;'"
			];
		}
		else if(vidf.test(copiedFA[i][0]))
		{
			var listVid_Lnk = " onclick='onLink(event,\"Other\",\"" + copiedFA[i][1] + "\");'";
			var listVid_Clr = "";

			if(/\.(mp4|webm)$/i.test(copiedFA[i][0]) && noah_mp3Okay)
			{
				listVid_Lnk = " onclick='onLink(event,\"VID\",\"" + copiedFA[i][1] + "\");'";
				listVid_Clr = " style='color:#a00;'";
			}

			str_arr = [resPrefix + "ico_video.png", listVid_Lnk, listVid_Clr];
		}
		else if(audf.test(copiedFA[i][0]))
		{
			var listSnd_Lnk = " onclick='onLink(event,\"Other\",\"" + copiedFA[i][1] + "\");'";
			var listSnd_Clr = "";

			if(/\.(mp3)$/i.test(copiedFA[i][0]) && noah_mp3Okay)
			{
				noah_mp3List.push(copiedFA[i][1]);

				listSnd_Lnk = " onclick='onLink(event,\"SND\",\"" + copiedFA[i][1] + "\");'";
				listSnd_Clr = " style='color:#0a3;'";
			}

			str_arr = [resPrefix + "ico_audio.png", listSnd_Lnk, listSnd_Clr];
		}
		else if(txtf.test(copiedFA[i][0])) str_arr[0] = resPrefix + "ico_text.png";
		else if(exef.test(copiedFA[i][0])) str_arr[0] = resPrefix + "ico_exe.png";
		else if(isof.test(copiedFA[i][0])) str_arr[0] = resPrefix + "ico_iso.png";
		else if(zipf.test(copiedFA[i][0])) str_arr[0] = resPrefix + "ico_zip.png";
		else 
		{
			str_arr[1] = " onclick='onLink(event,\"\",\"" + copiedFA[i][1] + "\");'";
			caption = copiedFA[i][0].substring(copiedFA[i][0].lastIndexOf(".")+1, copiedFA[i][0].length);
		}
		stringBuf +=
		"<div id='box#" + copiedFA[i][1] + "' class='img_box' title='" + copiedFA[i][0] + "' onmouseover='ToggleCheckbox(\"" + copiedFA[i][1] + "\");'" + str_arr[1] + "onmouseout='ToggleCheckbox(\"" + copiedFA[i][1] + "\");'>" +
		" <div id='highlight#" + copiedFA[i][1] + "' class='img_highlight'>" +
		"	<div id='chkdiv#" + copiedFA[i][1] + "' class='img_chk'" + ">" +
		"		<input type='checkbox' id='chkbox#" + copiedFA[i][1] + "' name='chkbox[]' value='" + copiedFA[i][1] + "' onclick='HighlightRow(\"" + copiedFA[i][1] + "\",this.checked);' />" +
		"		<a href='" + copiedFA[i][1] + "' onclick='return copy_fileAddress(this.href);'><img id='urlimg#" + copiedFA[i][1] + "' name='urlimg[]' src='" + resPrefix + "lnk_file.png' alt='File' /></a>" +
		"	</div>" +
		"	<div id='imgdiv#" + copiedFA[i][1] + "' class='img_div'><img id='img#" + copiedFA[i][1] + "' src='" + str_arr[0] + "' alt='' onerror='this.setAttribute(\"src\",\"" + resPrefix + "ico_etc.png\");'" + str_arr[1] + "> <div class='center'>"+ caption + "</div></div>" +
		"	<div id='namediv#" + copiedFA[i][1] + "' class='img_name text-cut'" + str_arr[2] + "" + str_arr[1] + ">" + copiedFA[i][0] + "</div> </div>" +
		"</div>\n";
	}

	if(!stringBuf) stringBuf = "<div class=\"init\">이 폴더는 비어 있습니다.</div>\n"

	document.getElementById("main").innerHTML = stringBuf;
}

// 사이드 메뉴 표시/숨김 (모바일)
function ToggleMenu()
{
	var obj = document.getElementById("nav");
	obj.style.display = (obj.style.display != "block") ? "block" : "none";
}

// 이미지 뷰어
var noah_imgList = [];

function ViewImage(event, iAct, iSrc)
{
	var e = event || window.event;
	var copiedIL = noah_imgList;

	var iDiv  = document.getElementById("ivWrap");
	var iLoad = document.getElementById("iv_load");
	var iPrev = document.getElementById("iv_prev");
	var iNext = document.getElementById("iv_next");
	var iPage = document.getElementById("iv_page");
	var iLoc = document.getElementById("location");
	
	if(iAct == "Close")
	{
		PagingImage(event, "off");

		iDiv.style.display  = "none";
		iLoad.style.display = "none";
		iPrev.style.display = "none";
		iNext.style.display = "none";
		iPage.style.display = "none";
		iLoc.style.display = "inline";
		
		try { document.documentElement.removeChild(document.getElementById("iv_core")); }
		catch(e) {}

		return false;
	}

	if(!iSrc || iSrc === undefined) return false;
	if(document.getElementById("iv_core")) ViewImage(event, "Close");

	iDiv.style.display  = "block";
	iLoad.style.display = "block";
	iLoc.style.display = "none";
	
	var iCore = document.createElement("IMG");

	iCore.setAttribute("id", "iv_core");
	iCore.setAttribute("src", iSrc);
	iCore.setAttribute("title", "이미지를 닫으려면 클릭하세요.");
	iCore.setAttribute("alt", "");

	iCore.onclick = function() { ViewImage(event, "Close"); }

	iCore.onload = function()
	{
		setTimeout(function()
		{
			iLoad.style.display = "none";
			$(iCore).fadeIn("fast");

			var cW = document.documentElement.clientWidth-6;
			var cH = document.documentElement.clientHeight-6;
			var iW, iH;

			if(iCore.width>cW || iCore.height>cH)
			{
				if(iCore.width > cW)
				{
					iW = cW;
					iH = Math.floor(cW*iCore.height/iCore.width);

					if(iH > cH)
					{
						iW = Math.floor(cH*iCore.width/iCore.height);
						iH = cH;
					}
				}
				else
				{
					iW = Math.floor(cH*iCore.width/iCore.height);
					iH = cH;

					if(iW > cW)
					{
						iW = cW;
						iH = Math.floor(cW*iCore.height/iCore.width);
					}
				}
			}
			else
			{
				iW = iCore.width;
				iH = iCore.height;
			}

			var cX = Math.floor((cW-iW)/2);
			var cY = Math.floor((cH-iH)/2);

			iCore.style.left = (cX<0) ? "0" : cX+"px";
			iCore.style.top  = (cY<0) ? "0" : cY+"px";
			iCore.width  = iW;
			iCore.height = iH;

			if(iAct == "All")
			{
				if(copiedIL.length > 1)
				{
					iPrev.style.display = "block";
					iNext.style.display = "block";

					document.onkeydown = function(event) { return PagingImage(event, "on"); }
				}

				iPage.style.display = "block";
			}
		}, 50);
	}

	iCore.onerror = function()
	{
		alert("이미지를 불러올 수 없습니다.");
		iLoad.style.display = "none";
		iCore.style.display = "none";

		if(iAct == "All")
		{
			if(copiedIL.length > 1)
			{
				iPrev.style.display = "block";
				iNext.style.display = "block";
				iPage.style.display = "block";

				document.onkeydown = function(event) { return PagingImage(event, "on"); }
			}
			else ViewImage(event, "Close");
		}
	}

	if(iAct == "All")
	{
		var now_idx = 0;

		for(var i=0, len=copiedIL.length; i<len; i++)
		{
			if(copiedIL[i] == iSrc)
			{
				now_idx = i;
				break;
			}
		}

		iPage.innerHTML = "<span class=\"vi_title text-cut\">"+decodeURIComponent(iSrc)+"</span>\n<span class=\"vi_index\">"+(now_idx+1)+" / "+copiedIL.length+"</span>";

		iPrev.onclick = function(event)
		{
			var prev_idx = (now_idx <= 0) ? copiedIL.length-1 : now_idx-1;
			ViewImage(event, "All", copiedIL[prev_idx], decodeURIComponent(copiedIL[prev_idx]));
		}
		iNext.onclick = function(event)
		{
			var next_idx = (now_idx >= copiedIL.length-1) ? 0 : now_idx+1;
			ViewImage(event, "All", copiedIL[next_idx], decodeURIComponent(copiedIL[next_idx]));
		}
	}

	document.documentElement.appendChild(iCore);
	iDiv.focus();
}

// 이미지 뷰어용 키보드 제어
function PagingImage(event, mode)
{
	if(mode == "on")
	{
		var e  = event || window.event;
		var ek = e.keyCode || e.which;

		var copiedIL = noah_imgList;

		if(ek == 27) ViewImage(event, "Close");
		else if(ek == 33 || ek == 37 || ek == 100) document.getElementById("iv_prev").click();
		else if(ek == 34 || ek == 39 || ek == 102) document.getElementById("iv_next").click();
		else if(ek == 36) ViewImage(event, "All", copiedIL[0]);
		else if(ek == 35) ViewImage(event, "All", copiedIL[copiedIL.length-1]);
		else if(ek == 116 || ek == 122) return;
		else
		{
			try
			{
				e.cancelBubble = true;
				e.returnValue = false;
				e.preventDefault();
			}
			catch(e) {}
		}
	}
	else
	{
		document.onkeydown = null;
	}

	return false;
}

// 비디오 플레이어
var noah_vidMini = false;

function PlayVideo(event, vAct, vSrc)
{
	var e = event || window.event;
	var dragging = false;

	var cW = document.documentElement.clientWidth;
	var cH = document.documentElement.clientHeight;

	var vDiv  = document.getElementById("vpWrap");
	var vLoc = document.getElementById("location");
	var vCore = document.getElementById("vp_core");
	var vHead = document.getElementsByClassName("vp_header");
	//var vStit = document.getElementById("vp_title");
	var vBtgl = document.getElementById("vp_toggle");

	if(!noah_mp3Okay) { return false; }

	switch(vAct)
	{
		case "Init" :
			if(vDiv.style.display != "none") PlayVideo(event, "Show");
		break;

		case "Show" :
			var vW, vH, vR, vB;
			var sFlag = (cW <= 820);

			dragging = false;
			vDiv.onmousedown = null;

			if(noah_vidMini)
			{
				vW = sFlag ? 220 : 460;
				vH = sFlag ? 144 : 280;
			}
			else
			{
				if(sFlag)
				{
					if(cW < cH)
					{
						vW = Math.floor(cW-20);
						vH = Math.floor((vW/16)*9+20);
					}
					else
					{
						vH = Math.floor(cH-80);
						vW = Math.floor((vH/9)*16-34);
					}
				}
				else
				{
					if(cW >= 1940 && cH >= 1120) { vW = 1920; vH = 1100; }
					else if(cW >= 1300 && cH >= 760) { vW = 1280; vH = 740; }
					else { vW = 800; vH = 470; }
				}
			}

			vR = noah_vidMini ? 10 : Math.floor((cW-vW)/2);
			vB = noah_vidMini ? 10 : Math.floor((cH-vH+10)/2);
			$(vDiv).css({ "width":vW+"px", "height":vH+"px", "top":"auto", "right":vR+"px", "bottom":vB+"px", "left":"auto" });

			vCore.width  = vW;
			vCore.height = vH-20;

			vBtgl.onclick   = noah_vidMini ? function() { PlayVideo(event, "Restore"); } : function() { PlayVideo(event, "Mini"); }
			vBtgl.innerHTML = noah_vidMini ? "&#xE5CE;" : "&#xE5CF;";
			vBtgl.title     = noah_vidMini ? "기본 크기로 복원" : "미니 플레이어";

			PlayVideo(event, "Move");
		break;

		case "Close" :
			vCore.onerror = null;

			vCore.removeAttribute("src");
			vCore.load();
			//vStit.innerHTML = "Video Player";
			vDiv.style.display = "none";
			vLoc.style.display = "inline";
		break;

		case "Mini" :
			noah_vidMini = true;
			PlayVideo(event, "Show");
		break;

		case "Restore" :
			noah_vidMini = false;
			PlayVideo(event, "Show");
		break;

		case "Move" :
			// https://codepen.io/Jonh/pen/jgyLB
			var eX, eY;

			$(vHead).on("mousedown touchstart", function(e) //vdiv
			{
				if(e.touches) e = e.touches[0];

				dragging = true;
				eX = e.pageX-vDiv.offsetLeft; // this -> vDiv
				eY = e.pageY-vDiv.offsetTop;

				if(!document.documentMode && !window.StyleMedia) vDiv.setCapture && vDiv.setCapture();
			});
			$(document).on("mousemove touchmove", function(e)
			{
				if(dragging)
				{
					e.preventDefault();

					if(e.touches) e = e.touches[0];

					var oX = e.pageX-eX;
					var oY = e.pageY-eY;
					var eW = parseInt(vDiv.style.width)+10;
					var eH = parseInt(vDiv.style.height)+10;

					if(oX < 10) oX = 10;
					if(oY < 10) oY = 10;
					if(oX > (cW-eW)) oX = cW-eW;
					if(oY > (document.documentElement.scrollTop+cH-eH)) oY = cH-eH;

					$(vDiv).css({ "top":oY+"px", "right":"auto", "bottom":"auto", "left":oX+"px" });

					return false;
				}
			});
			$(document).on("mouseup touchend", function(e)
			{
				dragging = false;
				e.cancelBubble = true;
			});
		break;

		default :
			vDiv.style.display = "block";
			PlayVideo(event, "Restore");

			if(vSrc)
			{
				if(!vCore.onerror) vCore.onerror = function()
				{
					alert("HTML5 비디오 처리중 오류가 발생했습니다.\n브라우저에서 파일 형식을 지원하지 않아서 생겼을수도 있습니다.");
					PlayVideo(event, "Close");
				};

				if(document.getElementById("vp_track")) vCore.removeChild(document.getElementById("vp_track"));

				var vTrck = document.createElement("TRACK");

				vTrck.setAttribute("id", "vp_track");
				vTrck.setAttribute("kind", "subtitles");
				vTrck.setAttribute("srclang", "ko");
				vTrck.setAttribute("label", "기본값");
				vTrck.setAttribute("default", "");
				vTrck.setAttribute("src", vSrc.replace(/\.(mp4|webm|ogv|ogg)$/i, ".vtt"));
				vCore.appendChild(vTrck);

				vCore.setAttribute("src", vSrc);
				vCore.load();
				vCore.play();
				vLoc.style.display = "none";
				//vStit.innerHTML = decodeURIComponent(vSrc);
			}
		// default break;
	}
}

// 오디오 플레이어
var noah_mp3Okay = !!document.getElementById("mp_core").canPlayType;
var noah_mp3List = [];
var noah_mp3Rand = false;
var noah_bwTitle = document.title;
var noah_showVol, noah_showPop;

function PlayAudio(event, mAct, mSrc)
{
	var e = event || window.event;
	var copiedML = noah_mp3List;

	var themeClr  = "#f6c";
	var blackClr  = "#000";

	var mDiv  = document.getElementById("mpWrap");
	var mCore = document.getElementById("mp_core");
	var mPlay = document.getElementById("mp_play");
	var mCvol = document.getElementById("mp_cvol");
	var mLoop = document.getElementById("mp_loop");
	var mRand = document.getElementById("mp_rand");
	var mList = document.getElementById("mp_list");
	var mPrev = document.getElementById("mp_prev");
	var mNext = document.getElementById("mp_next");

	var mPop  = document.getElementById("mp_popup");
	var mTdiv = document.getElementById("mp_tbar");
	var mName = document.getElementById("mp_title");
	var mIdx  = document.getElementById("mp_idx");
	var mTime = document.getElementById("mp_time");

	var mPbox = document.getElementById("mp_plbox");
	var mPlst = document.getElementById("mp_plist");

	var mVbar = document.getElementById("mp_vbar");
	var mVbgx = document.getElementById("mp_volbg");
	var mVfgx = document.getElementById("mp_volfg");
	var mVpnt = document.getElementById("mp_volpt");
	var mVtxt = document.getElementById("mp_voltt");

	var mPbar = document.getElementById("mp_pbar");
	var mPctl = document.getElementById("mp_seek");

	var mNaud = document.getElementById("nav_mp3p");
	var mNply = document.getElementById("nav_play");
	var mFoot = document.getElementById("footer");

	if(mAct == "Init")
	{
		if(noah_mp3Okay && copiedML.length)
		{
			var noah_mp3Plst = "";

			for(var i=0, no=0, len=copiedML.length; i<len; i++)
			{
				// http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
				no = String(parseInt(i+1));
				no = (no.length >= String(len).length) ? no : new Array(String(len).length-no.length+1).join("0")+no;

				noah_mp3Plst +=
				"<div id=\"mp#" + copiedML[i] + "\" class=\"text-cut\" title=\"" + decodeURIComponent(copiedML[i]) + "\" onclick=\"PlayAudio(event,'Open','" + copiedML[i] + "');\">" +
				"	<i>" + no + "</i>&nbsp; " + decodeURIComponent(copiedML[i]) +
				"</div>\n";
			}

			mPlay.style.color = themeClr;
			mVfgx.style.background = themeClr;
			mVtxt.style.background = themeClr;

			mPlst.innerHTML = noah_mp3Plst;
			mNaud.style.display = "block";

			PlayAudio(event, "NavIcon", "DISP");

			mCore.addEventListener("loadstart", function()
			{
				mPlay.innerHTML = "&#xE640;";
				mPlay.setAttribute("title", "파일 로드 중...");
				mNply.innerHTML = "&#xE640;";
				mNply.setAttribute("title", "파일 로드 중...");

				mPctl.style.width = "0";
			});
			mCore.addEventListener("loadeddata", function()
			{
				mPlay.innerHTML = "&#xE035;";
				mPlay.setAttribute("title", "재생 중");
				mNply.innerHTML = "&#xE034;";
				mNply.setAttribute("title", "재생 중");
			});
			mCore.addEventListener("play", function()
			{
				PlayAudio(event, "PopOn", "♬ " + decodeURIComponent(mCore.getAttribute("src")));
				mPctl.style.background = themeClr;

				mPlay.innerHTML = "&#xE035;";
				mPlay.setAttribute("title", "재생 중");
				mNply.innerHTML = "&#xE034;";
				mNply.setAttribute("title", "재생 중");
			});
			mCore.addEventListener("pause", function()
			{
				PlayAudio(event, "PopOn", "플레이어 일시 정지됨");
				mPctl.style.background = "#aaa";

				mPlay.innerHTML = "&#xE038;";
				mPlay.setAttribute("title", "일시 정지 중");
				mNply.innerHTML = "&#xE037;";
				mNply.setAttribute("title", "일시 정지 중");
			});
			mCore.addEventListener("ended", function()
			{
				mNext.click();
			});
			mCore.addEventListener("error", function()
			{
				alert("지원되지 않는 형식 또는 네트워크 문제로 파일을 재생할 수 없습니다.\n\n장비를 정지합니다.\n");
				PlayAudio(event, "Stop");
			});
			mCore.addEventListener("timeupdate", function()
			{
				var value = ((100/mCore.duration)*mCore.currentTime).toFixed(2);

				if(value < 0) value = 0;
				else if(value > 100) value = 100;

				mPctl.style.width = value+"%";
				mTime.innerHTML = SecToMin(mCore.currentTime)+"/"+SecToMin(mCore.duration);
			});
			mCore.addEventListener("volumechange", function()
			{
				var value = Math.floor(mCore.volume*100);

				mVfgx.style.height = value+"%";
				mVpnt.style.bottom = (value-10)+"px";
				mVtxt.style.bottom = (value-10)+"px";
				mVtxt.innerHTML = value+"%";

				PlayAudio(event, "Volume");
			});
		}
		else mPbar.style.display = "none";

		return false;
	}
	else if(mAct == "NavIcon")
	{
		if(noah_mp3Okay && copiedML.length)
		{
			if(mSrc == "DISP")
			{
				document.getElementById("nav_prev").style.display = mNaud.style.display;
				document.getElementById("nav_next").style.display = mNaud.style.display;
				document.getElementById("nav_play").style.display = mNaud.style.display;
			}
			else if(mSrc == "PREV") mPrev.click();
			else if(mSrc == "NEXT") mNext.click();
		}

		return false;
	}

	if(noah_mp3Okay)
	{
		if(copiedML.length < 1)
		{
			alert("재생할 항목이 없습니다.");
			return false;
		}
	}
	else
	{
		alert("사용자의 브라우저가 HTML5 오디오 기능을 지원하지 않습니다.");
		return false;
	}

	switch(mAct)
	{
		case "Show" :
			mNaud.style.display = "none";
			mFoot.style.padding = "20px 10px 57px";

			$(mDiv).slideDown("slow");
			$(mTdiv).slideDown("slow");

			PlayAudio(event, "NavIcon", "DISP");
			CanvasFX("on");
		break;

		case "Hide" :
			mNaud.style.display = "block";
			mFoot.style.padding = "20px 10px 30px";

			clearTimeout(noah_showVol);
			mCvol.style.color = blackClr;
			$(mVbar).fadeOut("fast");

			mList.style.color = blackClr;
			$(mPbox).fadeOut("fast");

			$(mDiv).slideUp("slow");
			$(mTdiv).slideUp("slow");

			PlayAudio(event, "NavIcon", "DISP");
			CanvasFX("off");
		break;

		case "Play" :
			if(!mCore.src) { return PlayAudio(event, "Open", copiedML[0]); }

			mCore.paused ? mCore.play() : mCore.pause();
		break;

		case "Stop" :
			mCore.removeAttribute("src");
			//mCore.load();
			document.title = noah_bwTitle;

			mPlay.innerHTML = "&#xE038;";
			mPlay.setAttribute("title", "재생");
			mNply.innerHTML = "&#xE037;";
			mNply.setAttribute("title", "재생");

			mName.innerHTML = "Music Player";
			mIdx.innerHTML  = "-/-";
			mTime.innerHTML = "--:--/--:--";
			mPctl.style.width = "0";

			PlayAudio(event, "PopOff");

			if(mDiv.style.display != "block") PlayAudio(event, "Show");
		break;

		case "Seek" :
			var value = Math.floor(e.pageX/mPbar.offsetWidth*100);

			try
			{
				e.cancelBubble = true;
				e.returnValue = false;
				e.preventDefault();
			}
			catch(e) {}

			if(mCore.currentSrc)
			{
				mCore.currentTime = (mCore.duration*value/100);
				PlayAudio(event, "PopOn", "구간 탐색: " + SecToMin(mCore.currentTime) + "/" + SecToMin(mCore.duration));
			}
		break;

		case "Repeat" :
			!mCore.loop ? PlayAudio(event, "PopOn", "현재곡을 반복 재생합니다.") : PlayAudio(event, "PopOn", "반복 재생: 꺼짐");
			mLoop.style.color = !mCore.loop ? themeClr : blackClr;
			mCore.loop = !mCore.loop;
		break;

		case "Shuffle" :
			!noah_mp3Rand ? PlayAudio(event, "PopOn", "재생 목록을 무작위로 재생합니다.") : PlayAudio(event, "PopOn", "셔플 재생: 꺼짐");
			mRand.style.color = !noah_mp3Rand ? themeClr : blackClr;
			noah_mp3Rand = !noah_mp3Rand;
		break;

		case "Volume" :
			if(mSrc == "SET")
			{
				var value = Math.floor(100-(e.pageY-$(mVbgx).offset().top));

				if(value < 2) value = 0;
				else if(value > 98) value = 100;

				mCore.volume = (value/100);
				mCvol.innerHTML = (value > 0) ? "&#xE050;" : "&#xE04F;";

				return false;
			}

			if(noah_showVol) clearTimeout(noah_showVol);

			mCvol.style.color   = themeClr;
			mVbar.style.left    = mCvol.offsetLeft+"px";
			mVbar.style.display = "block";
			noah_showVol = setTimeout(function() { clearTimeout(noah_showVol); mCvol.style.color = blackClr; $(mVbar).fadeOut("fast"); }, 3000);
		break;

		case "List" :
			mList.style.color = (mPbox.style.display != "block") ? themeClr : blackClr;

			if(mPbox.style.display != "block")
			{
				mPbox.style.display = "block";

				if(mCore.src)
				{
					try { mPlst.scrollTop = Math.floor(document.getElementById("mp#"+mCore.getAttribute("src")).offsetTop-45); }
					catch(e) {}
				}
			}
			else $(mPbox).fadeOut("fast");
		break;

		case "PopOn" :
			if(noah_showPop) clearTimeout(noah_showPop);

			mPop.innerHTML = mSrc;
			$(mPop).fadeIn("fast");
			noah_showPop = setTimeout(function() { PlayAudio(event, "PopOff"); }, 3000);
		break;

		case "PopOff" :
			clearTimeout(noah_showPop);
			$(mPop).fadeOut("fast");
		break;

		default :
			//if(mDiv.style.display != "block") PlayAudio(event, "Show");

			if(mSrc)
			{
				mCore.setAttribute("src", mSrc);
				mCore.load();
				mCore.play();
				mName.innerHTML = decodeURIComponent(mSrc);
				document.title = "♪ "+decodeURIComponent(mSrc)+" :: "+noah_bwTitle;
			}

			var now_idx = 0;
			var randVar = Math.floor(Math.random()*((copiedML.length-1)+1));

			for(var i=0, len=copiedML.length; i<len; i++)
			{
				var tmp = document.getElementById("mp#"+copiedML[i]);

				tmp.style.color = (copiedML[i] == mSrc) ? themeClr : blackClr;
				tmp.style.fontWeight = (copiedML[i] == mSrc) ? "bold" : "normal";

				if(copiedML[i] == mSrc) now_idx = i;
			}

			mIdx.innerHTML = (now_idx+1)+"/"+copiedML.length;
			$(mPlst).animate({ "scrollTop": Math.floor(document.getElementById("mp#"+copiedML[now_idx]).offsetTop-45) }, 300);

			mPrev.onclick = function()
			{
				var prev_idx = (now_idx <= 0) ? copiedML.length-1 : now_idx-1;
				noah_mp3Rand ? PlayAudio(event, "Open", copiedML[randVar]) : PlayAudio(event, "Open", copiedML[prev_idx]);
			}
			mNext.onclick = function()
			{
				var next_idx = (now_idx >= copiedML.length-1) ? 0 : now_idx+1;
				noah_mp3Rand ? PlayAudio(event, "Open", copiedML[randVar]) : PlayAudio(event, "Open", copiedML[next_idx]);
			}
		// default break;
	}
}

// 오디오 플레이어용 분 단위 변환
// http://codeaid.net/javascript/convert-seconds-to-hours-minutes-and-seconds-(javascript)
function SecToMin(secVal)
{
	if(isNaN(secVal)) { return "00:00"; }

	var Min = Math.floor(secVal/60);
	var Sec = Math.floor(secVal)-(Min*60);

	if(Min < 10) Min = "0"+Min;
	if(Sec < 10) Sec = "0"+Sec;

	return Min + ":" + Sec;
}

// 오디오 플레이어용 시각화
// http://thecodeplayer.com/walkthrough/glazing-ribbon-screensaver-effect-in-html5-canvas
var noah_drawTimer;

function CanvasFX(mode)
{
	var doc = document.documentElement;

	if(screen.width < 1280 || screen.height < 720) { return false; }

	if(mode == "off" || document.getElementById("mp_canvas"))
	{
		clearInterval(noah_drawTimer);
		doc.style.overflowY = "auto";

		$("#mp_canvas").animate({ "top":"50%", "height":"1px" }, "fast", function() { try{doc.removeChild(document.getElementById("mp_canvas"));}catch(e){}; });

		return false;
	}

	var cH   = doc.clientHeight;
	var divH = parseInt(cH/1.5);
	var cvs  = document.createElement("CANVAS");

	cvs.setAttribute("id", "mp_canvas");
	cvs.style.cssText = "display: none; position: fixed; z-index: 50; left: 0; top: 50%; width: 100%; height: 1px; background: #000; box-shadow: 0 0 10px #1a1a1a;";
	cvs.onclick = function() { CanvasFX("off"); }

	doc.appendChild(cvs);
	doc.style.overflowY = "hidden";

	if(!cvs.getContext) { return CanvasFX("off"); }

	function executeFX()
	{
		var particles = [];
		var ctx  = cvs.getContext("2d");
		var cvsW = cvs.offsetWidth;
		var cvsH = cvs.offsetHeight;

		cvs.setAttribute("width",  cvsW);
		cvs.setAttribute("height", cvsH);

		for(var i=0; i<25; i++) { particles.push(new particle()); }

		function particle()
		{
			this.location = { x: Math.random()*cvsW, y: Math.random()*cvsH };
			this.radius = 0;
			this.speed  = 3;
			this.angle  = Math.random()*360;
			var r = Math.round(Math.random()*255);
			var g = Math.round(Math.random()*255);
			var b = Math.round(Math.random()*255);
			var a = Math.random();
			this.rgba = "rgba("+r+", "+g+", "+b+", "+a+")";
		}

		function draw()
		{
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
			ctx.fillRect(0, 0, cvsW, cvsH);
			ctx.globalCompositeOperation = "lighter";

			for(var i=0, len=particles.length; i<len; i++)
			{
				var p1 = particles[i];
				ctx.fillStyle = "white";
				ctx.fillRect(p1.location.x, p1.location.y, p1.radius, p1.radius);

				for(var n=0; n<len; n++)
				{
					var p2 = particles[n];
					var yd = (p2.location.y-p1.location.y);
					var xd = (p2.location.x-p1.location.x);
					var distance = Math.sqrt(xd*xd + yd*yd);

					if(distance < 200)
					{
						ctx.beginPath();
						ctx.lineWidth = 1;
						ctx.moveTo(p1.location.x, p1.location.y);
						ctx.lineTo(p2.location.x, p2.location.y);
						ctx.strokeStyle = p1.rgba;
						ctx.stroke();
					}
				}

				p1.location.x = p1.location.x+(p1.speed*Math.cos(p1.angle*Math.PI/180));
				p1.location.y = p1.location.y+(p1.speed*Math.sin(p1.angle*Math.PI/180));

				if(p1.location.x < 0)    p1.location.x = cvsW;
				if(p1.location.x > cvsW) p1.location.x = 0;
				if(p1.location.y < 0)    p1.location.y = cvsH;
				if(p1.location.y > cvsH) p1.location.y = 0;
			}
		}

		noah_drawTimer = setInterval(draw, 30);
	}

	$("#mp_canvas").show().animate({ "top":(cH-divH)/2+"px", "height":divH+"px" }, "slow", function() { executeFX(); });
}

// 선택된 행 강조
function HighlightRow(link, checked)
{
	try { document.getElementById("box#"+link).style.background = checked ? "#cef" : ""; }
	catch(e) {}
}

// 체크박스 전환 처리
function ToggleCheckbox(ele, mode)
{
	var ediv = document.getElementById("chkdiv#"+ele);
	var echk = document.getElementById("chkbox#"+ele);

	if(mode)
	{
		if(mode == "N")
		{
			echk.checked = true;
			ediv.style.display = "block";
		}
		else if(mode == "Y")
		{
			echk.checked = false;
			ediv.style.display = "none";
		}
	}
	else
	{
		if(!echk.checked)
		{
			ediv.style.display = (ediv.style.display == "block") ? "none" : "block";
		}
	}

	HighlightRow(ele, echk.checked);
}

// 전체 선택/선택 해제
var selectToggle = "N";

function ToggleSelectAll()
{
	var cbs = document.getElementById("mainForm").elements;
	var saT = "<i class=\"material-icons\">&#xE162;</i>Select All";
	var dsT = "<i class=\"material-icons\">&#xE162;</i>Deselect";

	for(var i=0, len=cbs.length; i<len; i++)
	{
		if(cbs[i].name == "chkbox[]") ToggleCheckbox(cbs[i].id.substr(7,cbs[i].id.length), selectToggle);
	}

	if(i > 0)
	{
		if(selectToggle == "Y")
		{
			$("#selectAll-C").html(saT);
			$("#selectAll-T").html(saT);

			selectToggle = "N";
		}
		else
		{
			$("#selectAll-C").html(dsT);
			$("#selectAll-T").html(dsT);

			selectToggle = "Y";
		}
	}
}

// 플러그인 실행
function onPlugin(sel)
{
	var selectedFiles = "";
	var selectedCount = 0;

	var frm = document.getElementById("pluginForm");
	var cbs = document.getElementById("mainForm").elements;

	for(var i=0, len=cbs.length; i<len; i++)
	{
		if(cbs[i].name == "chkbox[]" && cbs[i].checked)
		{
			selectedFiles += cbs[i].value + "\n";
			selectedCount++;
		}
	}

	if(!sel || selectedCount < 1)
	{
		alert("선택된 항목이 없습니다.");
		return false;
	}

	if(sel == "PlayList.asx" && window.Blob)
	{
		var extVid = "3g2|3gp|3gp2|3gpp|asf|avi|divx|flv|k3g|m1v|m2t|m2ts|m2v|m4v|mkv|mov|mp2v|mp4|mpv2|mpg|mpeg|ogm|ogv|qt|rmvb|tp|ts|webm|wm|wmv";
		var extAud = "aac|aif|aifc|aiff|au|cda|fla|flac|kar|m4a|mid|midi|mka|mp1|mp2|mp3|mpa|mpc|oga|ogg|opus|snd|wav|wave|wma|wv";
		var regExp = new RegExp("\.(" + extVid + "|" + extAud + ")$", "i");

		var asxData = "";
		var asxPath = location.protocol+"//"+location.host+location.pathname;
		var asxList = selectedFiles.split("\n");

		for(var i=0, len=asxList.length; i<len; i++)
		{
			if(regExp.test(asxList[i]))
			{
				asxData +=
				"<entry>\r\n" +
				"	<title>" + decodeURIComponent(asxList[i]) + "</title>\r\n" +
				"	<ref href=\"" + asxPath + asxList[i] + "\" />\r\n" +
				"</entry>\r\n";
			}
		}

		if(!asxData)
		{
			alert("ASX 파일로 목록화할 항목이 없습니다.");
			return false;
		}

		var blobData = new Blob(["<asx version=\"3.0\">\r\n"+asxData+"</asx>"], {type: "video/x-ms-asf"}), blobUrl = window.URL.createObjectURL(blobData);

		navigator.msSaveOrOpenBlob ? navigator.msSaveOrOpenBlob(blobData, sel) : window.open(blobUrl);
		window.URL.revokeObjectURL(blobUrl);

		return false;
	}

	frm.action = "?action=Plugin&type=" + sel;
	frm.selectedFiles.value = selectedFiles;
	frm.submit();
}

// 파일 링크 처리
function onLink(event, mode, url)
{
	var e  = event || window.event;
	var el = e.target || e.srcElement;

	if(el.name != "chkbox[]" && el.name != "urlimg[]")
	{
		switch(mode)
		{
			case "Folder" :
				location.href = url;
				break;
			case "IMG" :
				ViewImage(event, "All", url);
				break;
			case "VID" :
				PlayVideo(event, "Open", url);
				break;
			case "SND" :
				PlayAudio(event, "Open", url);
				break;
			case "Other" :
				window.open(url);
				break;
			default :
				var doc = document.documentElement, link = document.createElement("A");

				doc.appendChild(link);
				$(link).attr("href",url).attr("target","_blank").attr("download",decodeURIComponent(url));
				link.click();
				doc.removeChild(link);
			// default break;
		}
	}
}

// 파일 주소 복사
function copy_fileAddress(url)
{
	var answer = confirm("선택한 항목의 URL을 확인하고 복사하시겠습니까?\n\n[취소]를 누르면 QR코드 이미지를 표시합니다.\n");

	if(answer) prompt("< 파일/폴더 주소 >\n아래의 URL을 복사하세요.", url);
	else
	{
		var qrApi = "http://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=" + url;
		ViewImage(event, "Single", qrApi);
	}

	return false;
}

// 현재 경로 나열
function write_splitDirs(dir)
{
	var arr = dir.split("/");
	var output = "<a href='" + appSuffix + "'>&nbsp;/&nbsp;</a>";

	if(dir != "/")
	{
		for(var i=0, len=arr.length; i<len; i++)
		{
			if(arr[i]) output += "<a href=\""+encodeURIComponent(dir.substr(0,dir.indexOf(arr[i])+arr[i].length)).replace(/%2f/gi,"/")+appSuffix+"\">"+arr[i]+"</a>";
		}
	}

	if(document.getElementById("location")) document.getElementById("location").innerHTML = output;
}

// 보조 레이어 태그 삽입
function write_assLayers()
{
	var ass =
	"<img id=\"iv_prev\" src=\""+resPrefix+"iv_arrow_l.png\" alt=\"\" />" +
	"<img id=\"iv_next\" src=\""+resPrefix+"iv_arrow_r.png\" alt=\"\" />" +
	"<div id=\"iv_page\"></div>" +

	"<div id=\"mp_popup\" onclick=\"PlayAudio(event,'PopOff');\"></div>" +

	"<div id=\"mp_tbar\"></div>" +

	"<div id=\"mp_vbar\" onclick=\"PlayAudio(event,'Volume','SET');\">" +
	"	<div id=\"mp_volbg\">" +
	"		<div id=\"mp_volfg\"></div>" +
	"		<img id=\"mp_volpt\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUhJREFUeNq0lb1qwzAUhV2hwcHkj0DqpdAumbvkCbL2OQp9oj5NnyAdPGdJoEtCMXFSTLwl58JRMaqlJopz4ANb1z4SuldXd8fXz8ihBAxBj88xxytQgj3Y8vmPdMOYGKTgHnQcEwpjcAAbsOaETuMBeACj6DzJxI+gC75AYQLKMn26wLSuEf8d2MYxV9qPwtWnR1w3TgNX2rTy1BgnTFRbEq9Es6Q6ng+fwQxM+T4HHyDzJHSoWac+0zcwqY298P3dY94zW+HSzDI1mjDmPFyqdqKaNA2MxSq6kZR9FC3NA2OVcjURSrK/aBhfMOZSqdmlxo4PMmb/knIT7TVb38FTy9k/JrbEa2u2YtNi3sSrNFUh/TRvwTSn128TqthPd1eY7uhR2f1YmvQycOU5/y1cN0jBGX88V5OdqLOuJrMtK/B9zWV6EmAASTtL48A/g2IAAAAASUVORK5CYII=\" />" +
	"		<div id=\"mp_voltt\">100%</div>" +
	"	</div>" +
	"	<i class=\"material-icons\" title=\"음소거\">&#xE04F;</i>" +
	"</div>" +

	"<div id=\"mp_pbar\" onclick=\"PlayAudio(event,'Seek');\">" +
	"	<div id=\"mp_seek\"></div>" +
	"</div>" +

	"<div id=\"mp_plbox\">" +
	"	<div class=\"mp_pheader\">" +
	"		<h1>" +
	"			Play List &nbsp;<span>for Audio Player</span>" +
	"			<i class=\"material-icons\" title=\"재생 목록 닫기\" onclick=\"PlayAudio(event,'List');\">&#xE5CD;</i>" +
	"		</h1>" +
	"	</div>" +
	"	<div id=\"mp_plist\"></div>" +
	"</div>" +
	"";

	document.write(ass);
}

// 버전 정보
function show_skinInfo()
{
	var str =
	"IconView plugin for Berryz WebShare \n\n" +
	"Version : 1.6 (build 20170801) \n" +
	"Created by Noah (http://noah4u.tistory.com) \n" +
	"Skin based on http://wallel.tistory.com/140 \n" +
	"Modified by Hisman Yosika\n" +
	"Icon From(Following CC License)\n" +
	"File icon by Kidiladon\n" +
	"Folder icon By Setyo Ari Wibowo\n\n" +
	"Included Components : \n" +
	"+ jQuery 1.12.4 & 3.2.1 [" + $.fn.jquery + " loaded] \n\n" +
	"User Agent : \n" + navigator.userAgent;

	alert(str);
}

// 페이지 로드 후 처리
window.onload = function()
{
	PlayAudio("", "Init");
	setTimeout(function() { $("#loading").css("top","-100px"); }, 100);
}

// 창 리사이즈 후 처리
window.onresize = function()
{
	ViewImage("", "Close");
	PlayVideo("", "Init");
	CanvasFX("off");
}

/* EOF; */