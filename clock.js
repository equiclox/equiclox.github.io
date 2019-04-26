let canvas, ctx;

let latitude = 51.470917;
let longitude = -2.614395;
let notice = document.getElementById("notice");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    notice.innerHTML = "Geolocation is not supported by this browser.";
    init();
  }
}

function showPosition(position) {
  notice.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
  init();

}

let coord = A.EclCoord.fromWgs84(latitude, longitude); // Bristol

function draw () {
    function getTime() {
        let now = new Date();
        let delta, factor, start;

        let jdo = new A.JulianDay(now);
        let r = A.Solar.times(jdo, coord);
        let rise = A.Coord.secondsToHMSStr(r.rise);
        let set = A.Coord.secondsToHMSStr(r.set);
        rise = moment.utc(rise, "HH:mm:ss").local().valueOf()
        set = moment.utc(set, "HH:mm:ss").local().valueOf()

        // if today's sunrise is in the future or today's sunset is in the past
        if (set < now) {
            // get tomorrows sunrise for factor
            let tomorrow = new Date();
            tomorrow.setDate(now.getDate()+1);
            jdo = new A.JulianDay(tomorrow);
            r = A.Solar.times(jdo, coord);
            rise = A.Coord.secondsToHMSStr(r.rise);
            rise = moment.utc(rise, "HH:mm:ss").add(1, 'days').local().valueOf();
            delta = rise - set;
            start = set;
        }
        else if (rise > now) {
            // get yesterday's sunset for factor
            jdo = new A.JulianDay(new Date().setDate(now.getDate()-1));
            r = A.Solar.times(jdo, coord);
            set = A.Coord.secondsToHMSStr(r.set);
            set = moment.utc(set, "HH:mm:ss").add(1, 'days').local().valueOf();
            delta = rise - set;
            start = set;
        }
        else {
            delta = set - rise;
            start = rise;
        }
        factor = Math.abs(delta) / 4.32e+7;

        let millisec = (now - start) / factor; // milliseconds since beginning of period
        let seconds = (millisec / 1000).toFixed(0);
        let minutes = Math.floor(seconds / 60);
        let hours = 0;
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            minutes = minutes - (hours * 60);
        }
        seconds = Math.floor(seconds % 60);
        return {hours: hours, minutes: minutes, seconds: seconds}
    }
    function getDigital() {
        let time = getTime();
        let hours = time.hours,
            minutes = time.minutes,
            seconds = time.seconds;

        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        return hours + ":" + minutes + ":" + seconds;
    }

    let time = getTime();
    let hours = time.hours,
        minutes = time.minutes,
        seconds = time.seconds,
        c = {x: canvas.width / 2, y: canvas.height / 2};

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';

    secondHand();
    minuteHand();
    hourHand();
    face();

    let digitalTime = getDigital();
    document.title = digitalTime;
    document.getElementById('digitalTime').innerText = digitalTime;

    function face () {
        // Border
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 140, 0, Math.PI * 2);
        ctx.stroke();

        // Dashes
        ctx.lineWidth = 3;
        for (let i = 0; i < 60; i++) {
            let r = 135,
                l = 5;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            if (i % 5 === 0)
                r -= l,
                l *= 2,
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            let v = new Vector(r, Math.PI * 2 * (i / 60) - Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(v.getX() + c.x, v.getY() + c.y);
            v.setMag(r + l);
            ctx.lineTo(v.getX() + c.x, v.getY() + c.y);
            ctx.stroke();
        }

        // Numbers
        ctx.font = '1.2em courier';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 1; i <= 12; i++) {
            let v = new Vector(113, Math.PI * 2 * (i / 12) - Math.PI / 2);
            ctx.fillText(i, v.getX() + c.x, v.getY() + c.y);
        }

        // Center button
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.75, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
    }

    function secondHand () {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        let a = Math.PI * 2 * (seconds / 60) - Math.PI / 2;
        let v = new Vector(95, a);
        let v2 = new Vector(-20, a);
        ctx.moveTo(v2.getX() + c.x, v2.getY() + c.y);
        ctx.lineTo(v.getX() + c.x, v.getY() + c.y);
        ctx.stroke();
    }

    function minuteHand () {
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        let a = Math.PI * 2 * (minutes / 60) - Math.PI / 2;
        let v = new Vector(95, a);
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(v.getX() + c.x, v.getY() + c.y);
        ctx.stroke();
    }

    function hourHand () {
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        let a = Math.PI * 2 * (hours / 12) - Math.PI / 2;
        let v = new Vector(60, a);
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(v.getX() + c.x, v.getY() + c.y);
        ctx.stroke();
    }
}

function init () {
    canvas = document.getElementById('clock');
    canvas.width = canvas.height = 300;
    ctx = canvas.getContext('2d');

    setInterval(draw, 500);
}

getLocation();
