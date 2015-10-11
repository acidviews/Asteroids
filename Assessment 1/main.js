//setting up Canvas
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
 
// delta time
var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
function getDeltaTime() // Only call this function once per frame
	{
		endFrameMillis = startFrameMillis;
		startFrameMillis = Date.now();
		var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
		if (deltaTime > 1) // validate that the delta is within range
			{
				deltaTime = 1;
			}
		return deltaTime;
	}
		
 //key events
window.addEventListener('keydown', function(evt) { onKeyDown(evt); }, false);
window.addEventListener('keyup', 	function(evt) { onKeyUp(evt); }, false);
 
//setting screen
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT= canvas.height;

// define some constant values for the game states
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var gameState = STATE_SPLASH;
var splashTimer = 5;
var gameOverTimer = 5;

// speeds
var ASTEROID_SPEED = 75;
var PLAYER_SPEED = 150;
var PLAYER_TURN_SPEED = 7;
var BULLET_SPEED = 300;
var spawnTimer = 5;		//first asteroid
var respawnTimer = 1.5	//all other asteroids
var shootTimer = 0;

// variables
var x = canvas.width/2;
var y = canvas.height/2;
var angle = 0;
var xSpeed = 0;
var ySpeed = 0;	
var shooting = false;
var PLAYER_SCORE = 0;	//player score
var PLAYER_HISCORE = 0;
var PLAYER_DEATHS = 0;

// background tile
var gameBg = document.createElement("img");
	gameBg.src = "bg.jpg";

//splash screen	tile
var splash = document.createElement("img");
	splash.src = "splash.jpg";	

//game over spash tile	
var gameOverSplash = document.createElement("img");
	gameOverSplash.src = "gameover.jpg";
	
// game background
var bg = [];
for(var y=0;y<15;y++)
{
	bg[y] = [];
	for(var x=0; x<20; x++)
	bg[y][x] = gameBg;
}

//splash background
var splashBg = [];
for(var y=0;y<15;y++)
{
	splashBg[y] = [];
	for(var x=0; x<20; x++)
	splashBg[y][x] = splash;
}	
	
//game over splash bg
var gameOverBg = [];
for(var y=0;y<15;y++)
{
	gameOverBg[y] = [];
	for(var x=0; x<20; x++)
	gameOverBg[y][x] = gameOverSplash;
}
	
//player
var player = 
{
	image: document.createElement("img"),     
	x: SCREEN_WIDTH/2,
	y: SCREEN_HEIGHT/2,
	width: 93,
	height: 80,
	directionX: 0,
	directionY: 0,
	angularDirection: 0,
	rotation: 0,
	hit: false,
	isDead: false,
}
player.image.src = "ship.png";	

//bullet array
var bullets = [];
	
//asteroid array
var asteroids = [];
		
//key code bindings
var KEY_SPACE = 32;
var KEY_LEFT  = 37;
var KEY_UP    = 38;
var KEY_RIGHT = 39;
var KEY_DOWN  = 40;
var KEY_A     = 65;
var KEY_S     = 83;	
				
//When key is down
function onKeyDown(event)
{	
	if(event.keyCode == KEY_UP)
	{			
		player.directionY = 1;
	}
	
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY =- 1;
	}
			
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection =- 1;
	}
			
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection =+ 1;
	}
				
	if (event.keyCode == KEY_SPACE)   
	{
		shooting = true;
	}
}
		
//key release
function onKeyUp(event)
{
	if(event.keyCode == KEY_UP)
	{
		player.directionY = 0;
	}
		
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY = 0;
	}
		
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection = 0;
	}
		
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection = 0;
	}
				
	if (event.keyCode == KEY_SPACE)   
	{
		shooting = false;
	}
}	

//shooting function
function playerShoot() 		
{   
	var bullet = 
	{
		image: document.createElement("img"),
		x: player.x,
		y: player.y,
		width: 5,
		height: 5,
		velocityX: 0,
		velocityY: 0
	};
	bullet.image.src = "bullet.png";
// start off with a velocity that shoots the bullet straight up
	var velX = 0;
	var velY = 1;
// now rotate this vector acording to the ship's current rotation
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	var xVel = (velX * c) - (velY * s);
	var yVel = (velX * s) + (velY * c);
	bullet.velocityX = xVel * BULLET_SPEED;
	bullet.velocityY = yVel * BULLET_SPEED;
// finally, add the bullet to the bullets array
	bullets.push(bullet);
} 	
	
//collision checking function
function intersects(x1, y1, w1, h1, x2, y2, w2, h2) 
{  
	if (y2 + h2 < y1 ||   
		x2 + w2 < x1 ||   
		x2 > x1 + w1 ||   
		y2 > y1 + h1)  
	{ 
		return false;	
	}  
	return true; 
}

// resetting game, player
function gameReset()
{
	PLAYER_SCORE = 0;
	bullets = [],
	asteroids = [],
	player.x = SCREEN_WIDTH/2,
	player.y = SCREEN_HEIGHT/2,
	player.directionX = 0,
	player.directionY = 0,
	player.angularDirection = 0,
	player.rotation = 0,
	player.hit = false,
	player.isDead = false
}
	
// Return a random number within the range of the two input variables
function rand(floor, ceil)
{
	return Math.floor( (Math.random()* (ceil-floor)) +floor );
}	
	
// asteroids spawn random small, medium or large)
function spawnAsteroid()
{	
	var type = rand(0, 3);
	var asteroid = {};
	
	if (type == 0 || type == 3) 
	{
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_large.png";
		asteroid.width = 69;
		asteroid.height = 75;
		asteroid.score = 10
	}
				
	if (type == 1) 
	{
		asteroid = {};
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_medium.png";
		asteroid.width = 40;
		asteroid.height = 50;
		asteroid.score = 30
	}
				
	if (type == 2)	
	{
		asteroid = {};
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_small.png";
		asteroid.width = 22;
		asteroid.height = 20;
		asteroid.score = 50
	}
	
// to set a random position just off screen, we'll start at the centre of the
// screen then move in a random direction by the width of the screen
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_HEIGHT/2;
	var dirX = rand(-10,10);
	var dirY = rand(-10,10);
// 'normalize' the direction will equal 1   
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude != 0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}
// now we can multiply the dirX/Y by the screen width to move that amount from
// the centre of the screen
	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
// add the direction to the original position to get the starting position of the
// asteroid
	asteroid.x = x + movX;
	asteroid.y = y + movY;
// now, the easy way to set the velocity so that the asteroid moves towards the
// centre of the screen is to just reverse the direction we found earlier
	asteroid.velocityX = -dirX * ASTEROID_SPEED;
	asteroid.velocityY = -dirY * ASTEROID_SPEED;
// finally we can add our new asteroid to the end of our asteroids array
	asteroids.push(asteroid);
}	

//splash screen text
function splashScreenText()
{
	context.fillStyle = "yellow";
	context.font="38px Arial";
	context.fillText("Asteroids!", 225, 50);
	context.font="22px Arial";
	context.fillText("Are Killing Planet Earth Please Save US!!!", 100, 75);
	context.font="14px Arial";
	context.fillText("<Space Bar> Shoot", 20, 475);
	context.fillText("<Arrow Keys> Movement", 450, 475);
}
		
// splash screen function
function runSplash(deltaTime)
{
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(splashBg [y][x], x*1, y*1);
		}
	}		
	splashTimer -= deltaTime;
	if(splashTimer <= 0)
	{
		gameReset(); //reset the game
		gameState = STATE_GAME;
		return;
	}
	splashScreenText();
}
	
//---------------------------------------- Game FUNCTION --------------------------------------------	
function runGame(deltaTime)
{	
// draw bg 1st everything else in the scene will be drawn on top of the tiled background
	for(var y=0; y<15; y++)
	{
		for(var x=0; x<20; x++)
		{
			context.drawImage(bg [y][x], x*32, y*32);
		}
	}

//draw score
	context.fillStyle = "yellow";
	context.font="12px Arial";
	context.fillText(PLAYER_SCORE, 10, 465);	
		
// update the shoot timer
	if(shootTimer > 0)
	{
		shootTimer -= deltaTime;
	}
		
//shoot
	if (shooting == true && shootTimer <= 0 && player.isDead == false)
	{
		playerShoot();
		shootTimer += 0.25;
	}
		
// update all the bullets
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].x += bullets[i].velocityX * deltaTime;
		bullets[i].y += bullets[i].velocityY * deltaTime;
	}
		
// check if the bullet has gone out of the screen and kill it
	for(var i=0; i<bullets.length; i++)
	{
		if(bullets[i].x < -bullets[i].width ||
		bullets[i].x > SCREEN_WIDTH ||
		bullets[i].y < -bullets[i].height ||
		bullets[i].y > SCREEN_HEIGHT)
		{
			bullets.splice(i, 1);
			break;   //remove it from the array
		}
	}
		
// draw all the bullets
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image,
		bullets[i].x - bullets[i].width/2,
		bullets[i].y - bullets[i].height/2);
	}
						
// update all the asteroids in the asteroids array
	for(var i=0; i<asteroids.length; i++)
	{
		
// update the asteroids position according to its current velocity.
		asteroids[i].x = asteroids[i].x + asteroids[i].velocityX * deltaTime;
		asteroids[i].y = asteroids[i].y + asteroids[i].velocityY * deltaTime;

//screen wrap asteroids
		if (asteroids[i].x - asteroids[i].width > SCREEN_WIDTH)
		{
			asteroids[i].x = 0;
		}
		
		if (asteroids[i].y - asteroids[i].height > SCREEN_HEIGHT)
		{
			asteroids[i].y = 0;	
		}
						
		if (asteroids[i].x + asteroids[i].width < 0)
		{
			asteroids[i].x = SCREEN_WIDTH ;
		}
	
		if (asteroids[i].y + asteroids[i].height < 0 )
		{
			asteroids[i].y = SCREEN_HEIGHT;	
		}
	}
	
// draw all the asteroids
	for(var i=0; i<asteroids.length; i++)
	{
		context.drawImage(asteroids[i].image, asteroids[i].x, asteroids[i].y);
	}

//asteroid spawns		
	spawnTimer -= deltaTime;
	if(spawnTimer <= 0)
	{
		spawnTimer = respawnTimer;
		spawnAsteroid();
	}

//collision with player			
	for(var i=0; i<asteroids.length; i++)
		{   		
			if(intersects(
			player.x - player.width/3, player.y - player.height/3,
			player.width/3, player.height/3,
			asteroids[i].x, asteroids[i].y,
			asteroids[i].width, asteroids[i].height) == true)
			{
				if (player.isDead == false)
				{
					if(PLAYER_SCORE > PLAYER_HISCORE)
					{
					  PLAYER_HISCORE = PLAYER_SCORE;
					}
				gameOverTimer = 5;
				PLAYER_DEATHS += 1;
				gameState = STATE_GAMEOVER
				break;
				}
			}
					
// check if any bullet intersects any asteroid. If so, kill them both
		for(var j=0; j<bullets.length; j++)
			{
				if(intersects(
				bullets[j].x, bullets[j].y,
				bullets[j].width, bullets[j].height,
				asteroids[i].x, asteroids[i].y,
				asteroids[i].width, asteroids[i].height) == true)
				{
					PLAYER_SCORE += asteroids[i].score;
					asteroids.splice(i, 1);
					bullets.splice(j, 1);
					break;
				}
			}
		}
			
// calculate sin and cos for the player's current rotation  
		 if (player.isDead == false)
			{	
				var s = Math.sin(player.rotation);  
				var c = Math.cos(player.rotation); 
				var xDir = (player.directionX * c) - (player.directionY * s);  
				var yDir = (player.directionX * s) + (player.directionY * c);  
				var xVel = xDir * PLAYER_SPEED * deltaTime;  
				var yVel = yDir * PLAYER_SPEED * deltaTime;
				
//screen wrap player
				if (player.x - player.width > SCREEN_WIDTH)
				{
					player.x = 0;
				}
		
				if (player.y - player.height > SCREEN_HEIGHT)
				{
					player.y = 0;	
				}
		
				if (player.x + player.width < 0)
				{
					player.x = SCREEN_WIDTH ;
				}
	
				if (player.y + player.height < 0 )
				{
					player.y = SCREEN_HEIGHT;	
				}
								
//player position
				player.x += xVel;           
				player.y += yVel;
				player.rotation += player.angularDirection * PLAYER_TURN_SPEED * deltaTime;
			}				
			
//draw player
		context.save();
			context.translate(player.x, player.y);
				context.rotate(player.rotation);	
			if (player.isDead == false)	
					{
						context.drawImage
						(player.image, -player.width/2, -player.height/2);
					}
				context.restore();
}

//game over splash text
function gameOverSplashText()
{
//gameover, current score		
	context.fillStyle = "yellow";
	context.font="30x Arial";
	context.fillText("GAME  OVER !", 225, 100);
	context.fillText("Your Score Is", 230, 125);
	context.font="26px Arial";
	context.fillText(PLAYER_SCORE, 285, 160);
//previous high score		
	context.font="20x Arial";
	context.fillText("High Score    " +  PLAYER_HISCORE , 200, SCREEN_HEIGHT/2);
//player deaths		
	context.fillStyle = "red";
	context.font="20px Arial";
	context.fillText("Deaths  ", 240, 475);
	context.fillText(PLAYER_DEATHS, 330, 475);    
}

//game over splash	
function runGameOver(deltaTime)
{
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(gameOverBg [y][x], x*1, y*1);
		}
	}		
	gameOverTimer -= deltaTime;
	if(gameOverTimer <= 0)
	{
		bullets = [];
		asteroids = [];
		player.isDead = true;
		splashTimer = 5;
		gameState = STATE_SPLASH;
		return;
	}
	gameOverSplashText();	
}
	
//--------------------------------------- RUN FUNCTION ------------------------------------------------------	
function run()
{
	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);
		
	var deltaTime = getDeltaTime();
		
//game state switch
	switch(gameState)
	{
		case STATE_SPLASH:
		runSplash(deltaTime);
		break;
		
		case STATE_GAME:
		runGame(deltaTime);
		break;
		
		case STATE_GAMEOVER:
		runGameOver(deltaTime);
		break;
	}	
	return;
	{
	}
}
	
//----------------------------------------------------------------------------
//No edits below here
// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
//-----------------------------------------------------------------------------					
(function() 
	{
	var onEachFrame;
		if (window.requestAnimationFrame) 
			{
				onEachFrame = function(cb) 
					{
						var _cb = function() 
							{ 
								cb(); window.requestAnimationFrame(_cb); 
							}
						_cb();
					};
			}	 
	else if (window.mozRequestAnimationFrame) 
		{
			onEachFrame = function(cb) 
				{
					var _cb = function() 
						{
							cb(); window.mozRequestAnimationFrame(_cb); 
						}
					_cb();
				};
		} 
	else 
		{
			onEachFrame = function(cb) 
				{
					setInterval(cb, 1000 / 60);
				}
		}
	window.onEachFrame = onEachFrame;
	}
)
();
window.onEachFrame(run);
