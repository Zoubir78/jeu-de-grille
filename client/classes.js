(function(factory) {
    if (typeof exports === 'object') {
      var common = require('./common.js');
      module.exports = factory(common);
    } else {
      this.classes = factory(common);
    }
})(function(common) {
  'use strict';

	///////////////////////////////////////////////////////////////////////
	//Classe de jeu
	///////////////////////////////////////////////////////////////////////
	
	var Game = function(params) {
	  var self = {};
	
		//paramètres de jeu par défaut
		self.id = Math.random();
		self.slide = 5;
		self.l = 20;
		self.pub = true;
	  self.playerList = {};
	
	  if(params.new) {
	    if(params.new.id) { self.id = params.new.id; }
	    if(params.new.l) self.l = params.new.l;
	    if(params.new.pub) self.pub = params.new.pub;
	
	
	  	self.board = common.createArray(self.l,self.l);
	  	for(var n = 0; n < self.l; n++) {
	  		for(var m = 0; m < self.l; m++) {
	  			self.board[n][m] = {id:null,prev:{count:0,dx:0,dy:0}};
	  		}
	  	}
	  }
	  self.playerLimit = Math.round(self.l*self.l/83.33333333);
	
	  if(params.copy) { self = params.copy; }
	
	  self.getPlayerCount = function() {
	    return Object.keys(self.playerList).length;
	  }
	
		//ajouter un joueur au tableau
		self.addPlayer = function(player) {
	    self.playerList[player.id] = player;
	
			var n = 0;
			var m = 0;
			var berth = 5;
	    var tries = 0;
	    var pieces = [];
	
			//trouver un espace pour les pièces à engendrer
			while(berth >= 1) {
				n = Math.floor(Math.random()*(self.l-2*berth))+berth;
				m = Math.floor(Math.random()*(self.l-2*berth))+berth;
	
				var check = 0;
				for(var i = -berth; i <= berth; i++) {
					for(var j = -berth; j <= berth; j++) {
						if(self.board[n+i][m+j].id) { check++; }
					}
				}
				if(!check) { break; }
	      else {
	  			tries++;
	  			if(tries > 50) { berth--; tries = 0; }
	      }
			}
	    if(berth < 1) { console.log("Jeu "+self.id+" n'a pas de place pour le joueur "+player.id); } 
	
			//ajouter des morceaux et obtenir le changement de score
			for(var i = 0; i <= 1; i++) {
				for(var j = 0; j <= 1; j++) {
					self.board[n+i][m+j].id = player.id;
					pieces.push({i:n+i,j:m+j,id:player.id});
					self.playerList[player.id].score++;
				}
			}
	    return pieces;
		}
	
		//retirer un joueur du tableau
	  self.removePlayer = function(id) {
	    var pieces = [];
	
	    delete self.playerList[id];
	
	    for(var i = 0; i < self.l; i++) {
	  		for(var j = 0; j < self.l; j++) {
	  			if(self.board[i][j].id == id) {
	         
						self.board[i][j].id = null;
						pieces.push({i:i,j:j,id:null});
	  			}
	  		}
	  	}
	    return pieces;
	  }
	
		self.makeMove = function(i,j,dx,dy) {
	    var id = self.board[i][j].id;
			var selfCount = 0;
			var otherCount = 0;
			var ok = true;
	    var pack = {players:[],pieces:[]};
	
			for(var n = 0; n < self.l; n++) {
				if(i+n*dx < 0 || i+n*dx >= self.l || j+n*dy < 0 || j+n*dy >= self.l) { ok = false; break; } 
				else if(self.board[i+n*dx][j+n*dy].prev.count > 0) { ok = false; break; } 
				else if(!self.board[i+n*dx][j+n*dy].id) { break; } 
				else {
					if(self.board[i+n*dx][j+n*dy].id == id && otherCount == 0) { selfCount++; } 
					else {
						otherCount++; 
						if(selfCount == otherCount) { ok = false; break; } 
					}
				}
			}
	
			
			if(ok) {
				for(var n = n; n > 0; n--) {
					self.board[i+n*dx][j+n*dy].id = self.board[i+(n-1)*dx][j+(n-1)*dy].id;
					var prev = {count:self.slide,dx:dx,dy:dy};
					self.board[i+n*dx][j+n*dy].prev = prev;
	        pack.pieces.push({i:i+n*dx,j:j+n*dy,id:self.board[i+(n-1)*dx][j+(n-1)*dy].id,prev:prev});
				}
				self.board[i][j].id = null; 
				self.board[i][j].prev.count = self.slide;
	      pack.pieces.push({i:i,j:j,id:null,prev:{count:self.slide}});
	
				do {
					var region = {minI:i+dx,maxI:i+dx,minJ:j+dy,maxJ:j+dy}
					var checked = common.createArray(self.l,self.l);
					var data = common.regionLoop(self,{region:region,checked:checked} , i, j);
					region = data.region;
	
					var groups = common.findGroups(self, region);
					var groupList = {};
	
					for(var n = 0; n < groups.length; n++) {
						for(var m = 0; m < groups[0].length; m++) {
							if(groups[n][m]) {
								var groupNum = groups[n][m];
								if(!groupList[groupNum]) {
									groupList[groupNum] = {id:self.board[n+region.minI][m+region.minJ].id,perimeter:0,neighbours:[]};
								}
	
								for(var a = -1; a < 2; a++) {
									for(var b = -1; b < 2; b++) {
										if(Math.abs(a) + Math.abs(b) == 1) {
											if(n+a == groups.length || n+a < 0 || m+b == groups[0].length || m+b < 0) { 
												groupList[groupNum].perimeter++;
											}
											else if(groups[n+a][m+b] != groupNum) { 
												groupList[groupNum].perimeter++;
												if(groups[n+a][m+b] && self.board[n+region.minI+a][m+region.minJ+b] != 1) { 
													groupList[groupNum].neighbours.push(self.board[n+region.minI+a][m+region.minJ+b].id);
												}
											}
										}
									}
								}
							}
						}
					}
	
					var captured = {};
					for(var n in groupList) {
	
						//algorithme pour trouver l'id de voisin qui se produit au maximum
						var store = groupList[n].neighbours;
						var frequency = {};
						var max = 0;
						var result = 0;
	
						for(var v in store) {
			        frequency[store[v]]=(frequency[store[v]] || 0)+1;
			        if(frequency[store[v]] > max) {
		            max = frequency[store[v]];
		            result = store[v];
			        }
						}
	
						//si plus de la moitié du périmètre couvert par le maximum de la zone d’environnement, ajouter "group:n captured by id:result"
						if(result != 1 && max/groupList[n].perimeter >= 0.5) { captured[n] = result; }
					}
	
					//transférer des pièces entre les joueurs pour toutes les captures
					for(var n = 0; n < groups.length; n++) {
						for(var m = 0; m < groups[0].length; m++) {
							if(groups[n][m]) {
								for(var v in captured) {
									if(v == groups[n][m]) { 
										if(self.board[n+region.minI][m+region.minJ].id != 1) { 
											
											self.playerList[self.board[n+region.minI][m+region.minJ].id].score--;
	                    pack.players.push(self.playerList[self.board[n+region.minI][m+region.minJ].id].getUpdatePack());
										}
										
										self.playerList[captured[v]].score++;
	                  pack.players.push(self.playerList[captured[v]].getUpdatePack());
	
										//éditer le tableau et emballer pour changer de pièce
										self.board[n+region.minI][m+region.minJ].id = captured[v];
	                  pack.pieces.push({i:n+region.minI,j:m+region.minJ,id:captured[v]});
									}
								}
							}
						}
					}
				} while(Object.keys(captured).length != 0);
	
				var groupCount = {};
				for(var n = 0; n < groups.length; n++) {
					for(var m = 0; m < groups[0].length; m++) {
						if(groups[n][m]) {
							if(groupCount[groups[n][m]]) { groupCount[groups[n][m]]++; }
							else { groupCount[groups[n][m]] = 1; }
						}
					}
				}
				for(var n = 0; n < groups.length; n++) {
					for(var m = 0; m < groups[0].length; m++) {
						var currId = self.board[n+region.minI][m+region.minJ].id;
						if(groups[n][m] && currId != 1) {
							for(var v in groupCount) {
								if(groupCount[v] == 1 && v == groups[n][m]) {
									self.board[n+region.minI][m+region.minJ].id = 1;
	                pack.pieces.push({i:n+region.minI,j:m+region.minJ,id:1});
	
									self.playerList[currId].score--;
	                pack.players.push(self.playerList[currId].getUpdatePack());
								}
							}
						}
					}
				}
			}
			return pack;
		};
	
	  self.pieceSpawn = function() {
	    var pieces = [];
	    var berth = 3;
	    var rate = self.l*self.l/10000;
	    var density = 1/100;
	    var target = self.l*self.l*density;
	
	    var count = 0;
	    for(var n = 0; n < self.l; n++) {
	      for(var m = 0; m < self.l; m++) {
	        if(self.board[n][m].id == 1) { count++; } 
	      }
	    }
	    var diff = target - count;
	    if(diff > 0) {
	      var tries = 0;
	      var n = null;
	      var m = null;
	
	      var spawnProb = rate;
	      if(Math.random() < spawnProb) {
	        while(berth >= 1) {
	    			n = Math.floor(Math.random()*(self.l-2*berth))+berth;
	    			m = Math.floor(Math.random()*(self.l-2*berth))+berth;
	
	    			var check = 0;
	    			for(var i = -berth; i <= berth; i++) {
	    				for(var j = -berth; j <= berth; j++) {
	    					if(self.board[n+i][m+j].id && self.board[n+i][m+j].id != 1) { check++; }
	    				}
	    			}
	    			if(!check) { break; }
	          else {
	      			tries++;
	      			if(tries > 50) { berth--; tries = 0; } 
	          }
	    		}
	        if(berth < 1) { console.log("Jeu "+self.id+" n'a pas de place pour spawn"); }
	
	
	        self.board[n][m].id = 1;
	        pieces.push({i:n,j:m,id:1});
	      }
	    }
	    if(diff < 0) { 
	      var killProb = rate/count;
	      for(var n = berth; n < self.l-berth; n++) { 
	    		for(var m = berth; m < self.l-berth; m++) {
	          if(self.board[n][m].id == 1) {
	            var check = 0;
	            for(var i = -berth; i <= berth; i++) {
	      				for(var j = -berth; j <= berth; j++) {
	      					if(self.board[n+i][m+j].id && self.board[n+i][m+j].id != 1) { check++; }
	      				}
	      			}
	
	            if(!check && Math.random() < killProb) {
	              self.board[n][m].id = null;
	              pieces.push({i:n,j:m,id:null});
	            }
	          }
	        }
	      }
	    }
	    return pieces;
	  };
	
	  self.boardSlide = function(view) {
			if(view) {
				for(var i = view.minI-5; i <= view.maxI+10; i++) {
					for(var j = view.minJ-5; j <= view.maxJ+10; j++) {
						if(i>=0 && i<self.l && j>=0 && j<self.l) {
							if(self.board[i][j].prev.count > 0) { self.board[i][j].prev.count--; }
						}
					}
				}
			}
			else {
				for(var i = 0; i < self.l; i++) {
					for(var j = 0; j < self.l; j++) {
						if(self.board[i][j].prev.count > 0) { self.board[i][j].prev.count--; }
					}
				}
			}
	  };
	
	  //réorganiser le classement en fonction du score
	  self.getLeaderboard = function() {
	    var leaderboard = [];
	    for(var i in self.playerList) { leaderboard.push({id:i,name:self.playerList[i].name,score:self.playerList[i].score,rank:0}); }
	    leaderboard.sort(function(a,b) { return a.score - b.score });
	    leaderboard = leaderboard.reverse();
	
	    var prevRank = 1;
	    var prevScore = 0;
	    for(var i = 0; i < leaderboard.length; i++) {
	      if(leaderboard[i].score != prevScore) { prevRank = i+1; }
	      prevScore = leaderboard[i].score;
	      leaderboard[i].rank = prevRank;
	    }
	    return leaderboard;
	  };
		return self;
	};
	
	
	///////////////////////////////////////////////////////////////////////
	//Classe de joueur
	///////////////////////////////////////////////////////////////////////
	
	var Player = function(params){
		var self = {};
	  if(params.new) {
	  	self.id = params.new.id;
	    self.name = params.new.name;
	    self.color = params.new.color;
	  	self.score = 0;
	  }
	  if(params.copy) {
	    self = params.copy;
	  }
	
		self.getUpdatePack = function() {
			return {id:self.id,score:self.score};
		};
	
		return self;
	};
	
	
	//return exports
	return {
		Game: Game,
		Player: Player
	};
});
