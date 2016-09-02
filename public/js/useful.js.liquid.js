var songs = [];
{% for audio in site.static_files %}
	{% if audio.path contains 'music' %}
		songs.push("{{audio.path}}");
	{% endif %}
{% endfor %}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
//shuffle(songs);

var durations = new Array();
var audioPlaylist = document.createElement("audio");
audioPlaylist.preload = "metadata";
var i = 0;
function getDurations() {
	var arraySize = songs.length;
	if(i < arraySize){
	    $(audioPlaylist)[0].src = songs[i];
	    $(audioPlaylist).on('loadedmetadata',function(){
	        durations[i]= Math.round($(audioPlaylist)[0].duration);
	        i++;
	        $(this).off('loadedmetadata');
	        getDurations();
	    });
	}
}
getDurations();

function index(arr, compare) { // binary search, with custom compare function
    var l = 0,
        r = arr.length - 1;
    while (l <= r) {
        var m = l + ((r - l) >> 1);
        var comp = compare(arr[m]);
        if (comp < 0) 
            l = m + 1;
        else if (comp > 0) 
            r = m - 1;
        else 
            return m;
    }
    return l-1; 
}

function Playlist() {
	setTimeout(function(){ 
		var sum = durations.reduce(add, 0);
		function add(a, b) {return a + b;}
		var sum = Math.round(sum)
		var dt = new Date();
		var secs = dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
		var nloops = Math.floor(86400/sum)
		var intervals = [for (i of Array(nloops*sum).keys()) i*sum]
		var deadsecs = 86400-nloops*sum
		var i = index(intervals, function(x){return x-secs;});
		var timeafterint = secs-intervals[i]

		var count = -1;
		var subtotal = 0;
		while(subtotal < timeafterint) {
			count += 1
			subtotal += durations[count];
			console.log(count);
			console.log(subtotal);
		}
		subtotal -= durations[count];
		var firstsong = songs[count];
		var play_at = timeafterint - subtotal;

		var audio = new Audio(songs[count]);
		audio.addEventListener('canplaythrough', function() {
		    if(this.currentTime < play_at){this.currentTime = play_at;};
		    this.play();
		});
		count +=1;

		var looping = function(){
			audio.addEventListener("ended", function(){
				if (count == songs.length)
					count = 0;
				audio = new Audio(songs[count]);
				audio.currentTime = 0;
				audio.play();
				count += 1;
				//jingle if odd or divsible by three...
				looping();
			});
		};
		looping();

		console.log("songs: "+songs);
		console.log("durations: "+durations);
		console.log("total duration: "+sum);
		console.log('nb audio loops: '+nloops);
		console.log('dead seconds before midnight: '+deadsecs);
		console.log("intervals: "+intervals);
		console.log("time after last interval: "+timeafterint);
		console.log("play this: "+firstsong+", begin at: "+play_at);
	}, 1000);
}