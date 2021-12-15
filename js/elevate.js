"use strict";

// ForEach polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: https://es5.github.io/#x15.4.4.18
if (!Array.prototype['forEach']) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.forEach called on null or undefined');
    }

    var T, k;
    var O = Object(this);
    var len = O.length >>> 0; // If isCallable(callback) is false, throw a TypeError exception.
    // See: https://es5.github.io/#x9.11

    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    if (arguments.length > 1) {
      T = thisArg;
    }

    k = 0;

    while (k < len) {
      var kValue;

      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }

      k++;
    }
  };
} // ------------------------------


var getID = function getID(x) {
  return document.getElementById(x);
},
    arrayFromClass = function arrayFromClass(x) {
  return Array.prototype.slice.call(document.getElementsByClassName(x));
};

function CL(elem, x, y) {
  // ClassList operations.
  switch (x) {
    case "add":
      return elem.classList.add(y);
      break;

    case "has":
      return elem.classList.contains(y);
      break;

    default:
      return elem.classList.remove(y);
  }
} // Visible output data.


var elevState = getID("elevstate"),
    showFloor = getID("currfloor"),
    elevDir = getID("direction");

function displayState() {
  // Updating state info seen by user.
  elevState.textContent = "elevator: " + state;
}

function showElev(elem, x) {
  // Abstract function for further usage.
  elem.textContent = x;
}

function display(x) {
  // Display output data according to a given parameter.
  if (x == "floor") {
    showElev(showFloor, currFloor);
  } else if (x == "direction") {
    showElev(elevDir, direction);
  }
} // Actual info.


var state = "still",
    currFloor = 5,
    direction = "",
    where;

function updateInfo() {
  displayState();
  display("floor");
  display("direction");
} // Show real-time output for user.


updateInfo();
var myTimeout = [];
var stops = []; // Clickable functionality of buttons.

var floorBtns = arrayFromClass("floorbtn");
floorBtns.forEach(function (btn) {
  // Select floor by clicking on a number.
  btn.addEventListener("click", selectFloor);
});

function selectFloor() {
  // Actions of elevator call.
  var next = this;

  if (boolState("isStill")) {
    setIt(next);
  }
}

function boolState(x) {
  // Logic: if ( isStill || isMoving || isWaiting ) => true.
  if (x == "isStill" && state == "still" || x == "isMoving" && state == "moving" || x == "isWaiting" && state == "waiting") {
    return true;
  } else {
    return false;
  }
}

function setIt(x) {
  // "Unconditionally" setting location.
  if (!CL(x, "has", "chosen") || !CL(x, "has", "light")) {
    // Select the caller's position after checking the conditions.
    CL(x, "add", "chosen"); // Set destination.

    setDestination(x); // Indicate moving elevators to all floors.

    lightOthers(); // Elevator answers to call.

    answer();
  }
}

function lightOthers() {
  // Every other floor won't be able to click the call elevator.
  floorBtns.forEach(function (btn) {
    if (!CL(btn, "has", "chosen")) {
      CL(btn, "add", "light");
    }
  });
}

function answer() {
  // Take action if someone calls the lift.
  if (currFloor == where) {
    state = "waiting";
    updateInfo();
    openDoor();
  } else {
    findWay();
  }
}

function findWay() {
  // Choose the right direction to the caller.
  if (currFloor < where) {
    direction = "↑";
    go("up");
  } else {
    direction = "↓";
    go("down");
  }

  updateInfo();
}

function go(x) {
  // Go by the right direction.
  state = "moving";

  if (x == "up") {
    differ = where - currFloor;
    stepByStep(differ, "+");
  } else {
    differ = currFloor - where;
    stepByStep(differ, "-");
  }
}

var bla = 4;

function stepByStep(x, y) {
  // Move through floors towards destination and stop.
  for (var i = 1; i <= x; i++) {
    myTimeout.push(setTimeout(function () {
      if (y == "+") {
        currFloor++;
      } else if (y == "-") {
        currFloor--;
      } // Real-time output.


      display("floor");
      updateInfo();
    }, i * 1300));
  }

  setTimeout(function () {
    // Stop at the right floor.
    state = "waiting";
    direction = "";
    updateInfo(); // Open the door for the passenger.

    openDoor();
  }, x * 1300);
} // The inside of an elevator.


var inside = getID("numbers");

function openDoor() {
  // Show buttons in the inside.
  CL(inside, "del", "hidden"); // Remove actual stop from order.

  stops.shift();

  if (stops.length < 1) {
    where = null;
  } else {
    where = stops[0];
  }

  noneBtn();
  waitForUser();
}

function waitForUser() {
  // Wait 3 seconds to be sure if someone entered elevator.
  var now = showFloor.textContent;
  setTimeout(function () {
    if (stops.length < 1 && showFloor.textContent == now) {
      closeDoor();
    }
  }, 3000);
}

function closeDoor() {
  // Hide the cabin's inside.
  hideInside();
  state = "still";
  updateInfo();
}

function clearOrder() {
  // Make floor buttons clickable again.
  floorBtns.forEach(function (btn) {
    CL(btn, "remove", "chosen");
    CL(btn, "remove", "light");
  });
}

function noneBtn() {
  // Make all floor buttons equally unusable - no chosen one
  floorBtns.forEach(function (btn) {
    CL(btn, "remove", "chosen");
    CL(btn, "add", "light");
  });
}

function hideInside() {
  // Doors aren't transparent - inside's hidden.
  CL(inside, "add", "hidden");
  clearOrder();
} // Functionality of control panel in the inside.


var controls = arrayFromClass("select");
controls.forEach(function (btn) {
  // Set next destination.
  btn.addEventListener("click", goToNext);
});

function goToNext() {
  // Go where passanger told you to.
  if (where != currFloor) {
    setDestination(this);
    hideInside();
    noneBtn();
    findWay();
  } else {
    waitForUser();
  }
}

var floorNum = function floorNum(x) {
  return parseInt(x.textContent, 10);
};

function setDestination(x) {
  // Tell elevator where to go.
  // Add order to an array of elevator's stops.
  stops.push(parseInt(x.textContent, 10)); // Sort stops in descending order.

  stops.sort(function (a, b) {
    return b - a;
  }); // Next destination is the nearest floor.

  where = stops[0];
}
