// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var str = 'xxxxxxxxxxxxxxxxxx';
function uid(n) {
	if( !n )
		n = 6;
	while( n > str.length ) str += str;
	return str.substr(0,n).replace(/x/g, function() {
		return (Math.random() * 16).toString(16)[0];
	});
};

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function range(n) {
	var ret = [];
	for( var i = 0; i < n; i++ )
		ret.push(i);
	return ret;
}

if(typeof module !== 'undefined') {
	module.exports.uid = uid;
}
