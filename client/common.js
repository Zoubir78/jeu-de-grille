(function(factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      this.common = factory();
    }
})(function() {
  'use strict';

  function createArray(length) {
    var arr = new Array(length || 0),
      i = length;
  
    if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
  }
  
  function selectPiece(game,selfId,i,j) {
    if(game.board[i][j].id == selfId && i>=0 && i<game.l && j>=0 && j<game.l) {
      return {i:i,j:j};
    }
    else { return {i:null,j:null}; }
  }
  
  
  ///////////////////////////////////////////////////////////////////////////
  //La logique pour rechercher récursivement des groupes lors de déplacements
  ///////////////////////////////////////////////////////////////////////////
  
  function findGroups(game, region) {
  	var groups = createArray(region.maxI-region.minI+1,region.maxJ-region.minJ+1);
  	var groupNum = 0;
  
  	//obtenir un tableau de pièces groupées
  	for(var n = 0; n < groups.length; n++) {
  		for(var m = 0; m < groups[0].length; m++) {
  			if(game.board[n+region.minI][m+region.minJ].id && !groups[n][m]) {
  				groupNum++;
  				groups = groupLoop(game,region,groups,n,m,groupNum);
  			}
  		}
  	}
  	return groups;
  }
  
  function groupLoop(game,region,groups,n,m,groupNum) {
  	groups[n][m] = groupNum;
  
    //attention aux bords de la planche
  	var maxA = n == groups.length-1 ? 1 : 2;
  	var minA = n == 0 ? 0 : -1;
  	var maxB = m == groups[0].length-1 ? 1 : 2;
  	var minB = m == 0 ? 0 : -1;
  
  	for(var a = minA; a < maxA; a++) {
  		for(var b = minB; b < maxB; b++) {
  			if(Math.abs(a) + Math.abs(b) == 1) {
  				if(game.board[n+region.minI+a][m+region.minJ+b].id == game.board[n+region.minI][m+region.minJ].id) {
            if(!groups[n+a][m+b]) {
  					  groups = groupLoop(game,region,groups,n+a,m+b,groupNum);
            }
  				}
  			}
  		}
  	}
  	return groups;
  }
  
  function regionLoop(game, data, i, j) {
    data.checked[i][j] = true;

    if(i < data.region.minI) data.region.minI = i;
    if(i > data.region.maxI) data.region.maxI = i;
    if(j < data.region.minJ) data.region.minJ = j;
    if(j > data.region.maxJ) data.region.maxJ = j;
  
    //attention aux bords de la planche
  	var maxA = i == game.l-1 ? 1 : 2;
  	var minA = i == 0 ? 0 : -1;
  	var maxB = j == game.l-1 ? 1 : 2;
  	var minB = j == 0 ? 0 : -1;
  
    for(var a = minA; a < maxA; a++) {
  		for(var b = minB; b < maxB; b++) {
  			if(Math.abs(a) + Math.abs(b) == 1) {
          if(game.board[i+a][j+b].id && !data.checked[i+a][j+b]) {
            data = regionLoop(game, data, i+a, j+b);
          }
        }
      }
    }
    return data;
  }
  
  return {
    selectPiece: selectPiece,
    createArray: createArray,
    findGroups: findGroups,
    regionLoop: regionLoop
  };
});

