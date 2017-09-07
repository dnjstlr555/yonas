/*----------------------------------------------------------------------------\
|                            Sortable Table 1.12                              |
|-----------------------------------------------------------------------------|
|                         Created by Erik Arvidsson                           |
|                  (http://webfx.eae.net/contact.html#erik)                   |
|                      For WebFX (http://webfx.eae.net/)                      |
|-----------------------------------------------------------------------------|
| A DOM 1 based script that allows an ordinary HTML table to be sortable.     |
|-----------------------------------------------------------------------------|
|                  Copyright (c) 1998 - 2004 Erik Arvidsson                   |
|-----------------------------------------------------------------------------|
| This software is provided "as is", without warranty of any kind, express or |
| implied, including  but not limited  to the warranties of  merchantability, |
| fitness for a particular purpose and noninfringement. In no event shall the |
| authors or  copyright  holders be  liable for any claim,  damages or  other |
| liability, whether  in an  action of  contract, tort  or otherwise, arising |
| from,  out of  or in  connection with  the software or  the  use  or  other |
| dealings in the software.                                                   |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| This  software is  available under the  three different licenses  mentioned |
| below.  To use this software you must chose, and qualify, for one of those. |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| The WebFX Non-Commercial License          http://webfx.eae.net/license.html |
| Permits  anyone the right to use the  software in a  non-commercial context |
| free of charge.                                                             |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| The WebFX Commercial license           http://webfx.eae.net/commercial.html |
| Permits the  license holder the right to use  the software in a  commercial |
| context. Such license must be specifically obtained, however it's valid for |
| any number of  implementations of the licensed software.                    |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| GPL - The GNU General Public License    http://www.gnu.org/licenses/gpl.txt |
| Permits anyone the right to use and modify the software without limitations |
| as long as proper  credits are given  and the original  and modified source |
| code are included. Requires  that the final product, software derivate from |
| the original  source or any  software  utilizing a GPL  component, such  as |
| this, is also licensed under the GPL license.                               |
|-----------------------------------------------------------------------------|
| 2003-01-10 | First version                                                  |
| 2003-01-19 | Minor changes to the date parsing                              |
| 2003-01-28 | JScript 5.0 fixes (no support for 'in' operator)               |
| 2003-02-01 | Sloppy typo like error fixed in getInnerText                   |
| 2003-07-04 | Added workaround for IE cellIndex bug.                         |
| 2003-11-09 | The bDescending argument to sort was not correctly working     |
|            | Using onclick DOM0 event if no support for addEventListener    |
|            | or attachEvent                                                 |
| 2004-01-13 | Adding addSortType and removeSortType which makes it a lot     |
|            | easier to add new, custom sort types.                          |
| 2004-01-27 | Switch to use descending = false as the default sort order.    |
|            | Change defaultDescending to suit your needs.                   |
| 2004-03-14 | Improved sort type None look and feel a bit                    |
| 2004-08-26 | Made the handling of tBody and tHead more flexible. Now you    |
|            | can use another tHead or no tHead, and you can chose some      |
|            | other tBody.                                                   |
|-----------------------------------------------------------------------------|
| Created 2003-01-10 | All changes are in the log above. | Updated 2004-08-26 |
\----------------------------------------------------------------------------*/


function SortableTable(oTable, oSortTypes)
{
	this.sortTypes = oSortTypes || [];

	this.sortColumn = null;
	this.descending = null;

	this.oldClassName = null;

	var oThis = this;

	this._headerOnclick = function(e) { oThis.headerOnclick(e); }
	//this._headerOnmousedown = function(e) { oThis.headerOnmousedown(e); }
	//this._headerOnmouseup = function(e) { oThis.headerOnmouseup(e); }

	if(oTable)
	{
		this.setTable(oTable);
		this.document = oTable.ownerDocument || oTable.document;
	}
	else
	{
		this.document = document;
	}


	// only IE needs this
	var win = this.document.defaultView || this.document.parentWindow;

	this._onunload = function() { oThis.destroy(); }

	if(win && typeof win.attachEvent != "undefined") win.attachEvent("onunload", this._onunload);
}

SortableTable.gecko = navigator.product == "Gecko";
SortableTable.msie = /msie/i.test(navigator.userAgent);
// Mozilla is faster when doing the DOM manipulations on
// an orphaned element. MSIE is not
SortableTable.removeBeforeSort = SortableTable.gecko;

SortableTable.prototype.onsort = function() {}

// default sort order. true -> descending, false -> ascending
SortableTable.prototype.defaultDescending = false;

// shared between all instances. This is intentional to allow external files
// to modify the prototype
SortableTable.prototype._sortTypeInfo = {}

SortableTable.prototype.setTable = function(oTable)
{
	if(this.tHead) this.uninitHeader();

	this.element = oTable;
	this.setTHead(oTable.tHead);
	this.setTBody(oTable.tBodies[0]);
}

SortableTable.prototype.setTHead = function(oTHead)
{
	if(this.tHead && this.tHead != oTHead) this.uninitHeader();

	this.tHead = oTHead;
	this.initHeader(this.sortTypes);
}

SortableTable.prototype.setTBody = function(oTBody)
{
	this.tBody = oTBody;
}

SortableTable.prototype.setSortTypes = function(oSortTypes)
{
	if(this.tHead) this.uninitHeader();

	this.sortTypes = oSortTypes || [];

	if(this.tHead) this.initHeader(this.sortTypes);
}

// adds arrow containers and events
// also binds sort type to the header cells so that reordering columns does
// not break the sort types
SortableTable.prototype.initHeader = function(oSortTypes)
{
	if(!this.tHead) return;

	var cells = this.tHead.rows[0].cells;
	var doc = this.tHead.ownerDocument || this.tHead.document;

	this.sortTypes = oSortTypes || [];

	var l = cells.length;
	var img, c;
	var c_child;

	for(var i = 0; i < l; i++)
	{
		c = cells[i];

		if(this.sortTypes[i] != null && this.sortTypes[i] != "None")
		{
			img = doc.createElement("SPAN");
			img.className = "sort-arrow";
			img.innerHTML = "";
			c.appendChild(img);

			if(this.sortTypes[i] != null) c._sortType = this.sortTypes[i];

			if(typeof c.addEventListener != "undefined")
			{
				c.addEventListener("click", this._headerOnclick, false);
				//c.addEventListener("mousedown", this._headerOnmousedown, false);
				//c.addEventListener("mouseup", this._headerOnmouseup, false);
			}
			else if(typeof c.attachEvent != "undefined")
			{
				c.attachEvent("onclick", this._headerOnclick);
				//c.attachEvent("onmousedown", this._headerOnmousedown);
				//c.attachEvent("onmouseup", this._headerOnmouseup);
			}
			else
			{
				c.onclick = this._headerOnclick;
				//c.onmousedown = this._headerOnmousedown;
				//c.onmouseup = this._headerOnmouseup;
			}
		}
		else
		{
			c.setAttribute("_sortType", oSortTypes[i]);
			c._sortType = "None";
		}
	}
	this.updateHeaderArrows();
}

// remove arrows and events
SortableTable.prototype.uninitHeader = function()
{
	if(!this.tHead) return;

	var cells = this.tHead.rows[0].cells;
	var l = cells.length;
	var c;

	for(var i = 0; i < l; i++)
	{
		c = cells[i];

		if(c._sortType != null && c._sortType != "None")
		{
			c.removeChild(c.lastChild);

			if(typeof c.removeEventListener != "undefined")
			{
				c.removeEventListener("click", this._headerOnclick, false);
				//c.removeEventListener("mousedown", this._headerOnmousedown, false);
				//c.removeEventListener("mouseup", this._headerOnmouseup, false);
			}
			else if(typeof c.detachEvent != "undefined")
			{
				c.detachEvent("onclick", this._headerOnclick);
				//c.detachEvent("onmousedown", this._headerOnmousedown);
				//c.detachEvent("onmouseup", this._headerOnmouseup);
			}

			c._sortType = null;
			c.removeAttribute("_sortType");
		}
	}
}

SortableTable.prototype.updateHeaderArrows = function()
{
	if(!this.tHead) return;

	var cells = this.tHead.rows[0].cells;
	var l = cells.length;
	var img;

	for(var i = 0; i < l; i++)
	{
		if(cells[i]._sortType != null && cells[i]._sortType != "None")
		{
			img = cells[i].lastChild;

			if(i == this.sortColumn)
				img.className = "sort-arrow " + (this.descending ? "descending" : "ascending");
			else
				img.className = "sort-arrow";
		}
	}
}

/*
SortableTable.prototype.headerOnmousedown = function(e)
{
	find TD element
	var el = e.target || e.srcElement;
	while (el.tagName != "TH")
		el = el.parentNode;

	this.oldClassName = el.className;
	el.className = "pushed";
}

SortableTable.prototype.headerOnmouseup = function(e)
{
	find TD element
	var el = e.target || e.srcElement;
	while (el.tagName != "TH")
		el = el.parentNode;

	el.className = this.oldClassName;
	this.oldClassName = null;
}
*/

SortableTable.prototype.headerOnclick = function(e)
{
	// find TD element
	var el = e.target || e.srcElement;

	while(el.tagName != "TH") { el = el.parentNode; }

	this.sort(SortableTable.msie ? SortableTable.getCellIndex(el) : el.cellIndex);
}

// IE returns wrong cellIndex when columns are hidden
SortableTable.getCellIndex = function(oTd)
{
	var cells = oTd.parentNode.childNodes
	var l = cells.length;

	for(var i = 0; cells[i] != oTd && i < l; i++) {}

	return i;
}

SortableTable.prototype.getSortType = function(nColumn)
{
	return this.sortTypes[nColumn] || "String";
}

// only nColumn is required
// if bDescending is left out the old value is taken into account
// if sSortType is left out the sort type is found from the sortTypes array

SortableTable.prototype.sort = function(nColumn, bDescending, sSortType)
{
	if(!this.tBody) return;

	if(sSortType == null) sSortType = this.getSortType(nColumn);

	// exit if None
	if(sSortType == "None") return;

	if(bDescending == null)
	{
		if(this.sortColumn != nColumn)
			this.descending = this.defaultDescending;
		else
			this.descending = !this.descending;
	}
	else
	{
		this.descending = bDescending;
	}

	this.sortColumn = nColumn;

	if(typeof this.onbeforesort == "function") this.onbeforesort();

	var f = this.getSortFunction(sSortType, nColumn);
	var a = this.getCache(sSortType, nColumn);
	var tBody = this.tBody;

	a.sort(f);

	if(this.descending)
	{
		a.reverse();
	}

	if(SortableTable.removeBeforeSort)
	{
		// remove from doc
		var nextSibling = tBody.nextSibling;
		var p = tBody.parentNode;

		p.removeChild(tBody);
	}

	// insert in the new order
	var l = a.length;

	// Folder/File separation　(by Noah)
	for(var i = 0; i < l; i++)
	{
		if(a[i].element.className && a[i].element.className == "folder") tBody.appendChild(a[i].element);
	}
	for(var i = 0; i < l; i++)
	{
		if(!a[i].element.className || a[i].element.className != "folder") tBody.appendChild(a[i].element);
	}

	if(SortableTable.removeBeforeSort)
	{
		// insert into doc
		p.insertBefore(tBody, nextSibling);
	}

	this.updateHeaderArrows();
	this.destroyCache(a);

	if(typeof this.onsort == "function") { this.onsort(); }
}

SortableTable.prototype.asyncSort = function(nColumn, bDescending, sSortType)
{
	var oThis = this;

	this._asyncsort = function() { oThis.sort(nColumn, bDescending, sSortType); }

	window.setTimeout(this._asyncsort, 1);
}

SortableTable.prototype.getCache = function(sType, nColumn)
{
	if(!this.tBody) return [];

	var rows = this.tBody.rows;
	var l = rows.length;
	var a = new Array(l);
	var r;

	for(var i = 0; i < l; i++)
	{
		r = rows[i];

		a[i] = {
			value:   this.getRowValue(r, sType, nColumn),
			element: r
		}
	}
	return a;
}

SortableTable.prototype.destroyCache = function(oArray)
{
	var l = oArray.length;

	for(var i = 0; i < l; i++)
	{
		oArray[i].value = null;
		oArray[i].element = null;
		oArray[i] = null;
	}
}

SortableTable.prototype.getRowValue = function(oRow, sType, nColumn)
{
	// if we have defined a custom getRowValue use that
	if(this._sortTypeInfo[sType] && this._sortTypeInfo[sType].getRowValue) { return this._sortTypeInfo[sType].getRowValue(oRow, nColumn); }

	var s;
	var c = oRow.cells[nColumn];

	try
	{
		if(typeof c.innerText != "undefined")
			s = c.innerText;
		else
			s = SortableTable.getInnerText(c);
	}
	catch(e) {}

	return this.getValueFromString(s, sType);
}

SortableTable.getInnerText = function(oNode)
{
	var s = "";
	var cs = oNode.childNodes;
	var l = cs.length;

	for(var i = 0; i < l; i++)
	{
		switch (cs[i].nodeType)
		{
			case 1: // ELEMENT_NODE
				s += SortableTable.getInnerText(cs[i]);
				break;
			case 3: // TEXT_NODE
				s += cs[i].nodeValue;
				break;
		}
	}

	return s;
}

SortableTable.prototype.getValueFromString = function(sText, sType)
{
	if(this._sortTypeInfo[sType]) { return this._sortTypeInfo[sType].getValueFromString(sText); }

	return sText;
	/*
	switch (sType) {
		case "Number":
			return Number(sText);
		case "CaseInsensitiveString":
			return sText.toUpperCase();
		case "Date":
			var parts = sText.split("-");
			var d = new Date(0);
			d.setFullYear(parts[0]);
			d.setDate(parts[2]);
			d.setMonth(parts[1] - 1);
			return d.valueOf();
	}
	return sText;
	*/
}

SortableTable.prototype.getSortFunction = function(sType, nColumn)
{
	if(this._sortTypeInfo[sType]) { return this._sortTypeInfo[sType].compare; }

	return SortableTable.basicCompare;
}

SortableTable.prototype.destroy = function()
{
	this.uninitHeader();

	var win = this.document.parentWindow;

	if(win && typeof win.detachEvent != "undefined") // only IE needs this
	{
		win.detachEvent("onunload", this._onunload);
	}

	this._onunload = null;
	this.element = null;
	this.tHead = null;
	this.tBody = null;
	this.document = null;
	this._headerOnclick = null;
	//this._headerOnmouseover = null;
	//this._headerOnmouseup = null;
	this.sortTypes = null;
	this._asyncsort = null;
	this.onsort = null;
}

// Adds a sort type to all instance of SortableTable
// sType : String - the identifier of the sort type
// fGetValueFromString : function(s : string) : T - A function that takes a
//    string and casts it to a desired format. If left out the string is just
//    returned
// fCompareFunction : function(n1 : T, n2 : T) : Number - A normal JS sort
//    compare function. Takes two values and compares them. If left out less than,
//    <, compare is used
// fGetRowValue : function(oRow : HTMLTRElement, nColumn : int) : T - A function
//    that takes the row and the column index and returns the value used to compare.
//    If left out then the innerText is first taken for the cell and then the
//    fGetValueFromString is used to convert that string the desired value and type

SortableTable.prototype.addSortType = function(sType, fGetValueFromString, fCompareFunction, fGetRowValue)
{
	this._sortTypeInfo[sType] =
	{
		type:               sType,
		getValueFromString: fGetValueFromString || SortableTable.idFunction,
		compare:            fCompareFunction || SortableTable.basicCompare,
		getRowValue:        fGetRowValue
	}
}

// this removes the sort type from all instances of SortableTable
SortableTable.prototype.removeSortType = function(sType)
{
	delete this._sortTypeInfo[sType];
}

SortableTable.basicCompare = function compare(n1, n2)
{
	if(n1.value < n2.value) { return -1; }

	if(n2.value < n1.value) { return 1; }

	return 0;
}

SortableTable.invertCompare = function compare(n1, n2)
{
	if(n1.value > n2.value) { return -1; }

	if(n2.value > n1.value) { return 1; }

	return 0;
}

SortableTable.idFunction = function(x)
{
	return x;
}

SortableTable.toUpperCase = function(s)
{
	try { return s.toUpperCase(); }
	catch(e) {}
}

SortableTable.toDate = function(s)
{
	try
	{
		var parts = s.split("-");
		var d = new Date(0);

		d.setFullYear(parts[0]);
		d.setDate(parts[2]);
		d.setMonth(parts[1] - 1);

		return d.valueOf();
	}
	catch(e) {}
}

SortableTable.toDateTime = function(s)
{
	try
	{
		var timeparts = s.split(" ");

		while(timeparts[0] == 0) { timeparts.shift(); }

		var parts = timeparts[0].split("-");
		var d = new Date(0);

		d.setFullYear(parts[0]);
		d.setDate(parts[2]);
		d.setMonth(parts[1] - 1);

		var hourbase = (timeparts[1] == "AM")? 0: 12;
		var hourparts = timeparts[2].split(":");

		d.setHours(hourparts[0]%12+hourbase, hourparts[1]);

		return d.getTime();
	}
	catch(e) {}
}

SortableTable.toNumber = function(s)
{
	try
	{
		var value = parseInt(s.replace(/,/g, ""));

		if(value*0 == 0) // normal number
		{
			return value;
		}
		else             // NaN
		{
			return -1;
		}
	}
	catch(e) {}
}

// add sort types
SortableTable.prototype.addSortType("Number", SortableTable.toNumber);
SortableTable.prototype.addSortType("CaseInsensitiveString", SortableTable.toUpperCase);
SortableTable.prototype.addSortType("Date", SortableTable.toDate);
SortableTable.prototype.addSortType("String");
SortableTable.prototype.addSortType("InvertString", null, SortableTable.invertCompare);
SortableTable.prototype.addSortType("InvertTime", SortableTable.toDateTime, SortableTable.invertCompare);
// None is a special case