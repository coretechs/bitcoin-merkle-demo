const sha256 = require("js-sha256");

function byteArrToHex (byteArr) {
    let hex = "", h = "", x = "", len = byteArr.length;
    for(let i = 0; i < len; i++) {
        x = byteArr[i];
        h = x.toString(16);
        if (x < 16) h = "0" + h;
        hex += h;
    }
    return hex;
}

function hexToByteArr (hex) {
    let arr = [];
    for(let i = 0; i < hex.length; i += 2) {
        arr.push(parseInt(hex.substr(i, 2), 16));
    }
    return arr;
}

function doubleSha256 (input) {
  return sha256.digest(sha256.digest(input));
}

// block 518588
// big-endian hex
let transactionsArr = ["46ceb4677d2c95d356105ada337003d8cf8c5df7cd6de7497e9cddb0f60bc2a2",
"11e110e547d2880fb80d44c6db120384a8c01955594a6865ace3fbf5ab22386b",
"07f21a36e6044ac76e53708ee547d1ceee04daddb3240af9210fbfde37b44635",
"ed16c2e218daab8e00490e43ce64f1fa710568a80e12e263b12e78c729db9f24",
"eee45c3778f8d7043bf16bdc1ed068c68770a5ba3a40e0975b2c84d63a9e8aba",
"75089e23122717a4984fcabaefe82e334cac31127372cd38680369b99a4e2c1f",
"3ebc7e00a8fcc3ea7ef50f1e9aa51c373fbb380c9a6aa6266036646962970a49",
"cf3685df701793eb7d38f39cac244c91909e03263237aef501a83560e36722a4",
"5bab4a2f361e22004f62764e7634e166600089d4659756e8b5f3ed677e3a06d8",
"4139e3d2ea370d085e78025c2a9b36641c8ddc4e38919b7ae6260666d9c476eb"];

function merklize (txArr) {
	let retArr = [];
	
	console.log("--- " + txArr.length + " nodes ---");
	console.log(txArr);	
	
	while(txArr.length) {
		// convert hex to little-endian byte arrays
		let node1 = hexToByteArr(txArr.shift()).reverse();
		let node2 = txArr.length ? hexToByteArr(txArr.shift()).reverse() : node1;
		let res = doubleSha256(node1.concat(node2));

		// convert back to big-endian hex
		let resHex = byteArrToHex(res.reverse());
		retArr.push(resHex);
	}
	
	if(retArr.length === 1) {
		console.log("merkle root: " + retArr);
		return;
	}
	
	merklize(retArr);
}

merklize(transactionsArr);

console.log(`
                           ------------------ecc7-----
                         /                             \\
               ------5d85------                         98da
             /                  \\                      /
         226a                    cf3e                 5a9b  (59ab)
       /      \\                /      \\              /
   827f        1203        b8c0        0e90        f5dd  (f5dd)
   /  \\        /  \\        /  \\        /  \\        /  \\
46ce  11e1  07f2  ed16  eee4  7509  3ebc  cf36  5bab  4139
`);

/*
                           ------------------ecc7-----
                         /                             \
               ------5d85------                         98da
             /                  \                      /
         226a                    cf3e                 5a9b  (59ab)
       /      \                /      \              /
   827f        1203        b8c0        0e90        f5dd  (f5dd)
   /  \        /  \        /  \        /  \        /  \
46ce  11e1  07f2  ed16  eee4  7509  3ebc  cf36  5bab  4139
*/


// To prove that 5bab is in the block, we need 5d85 and 4139
let nodeArr1 = ["5bab4a2f361e22004f62764e7634e166600089d4659756e8b5f3ed677e3a06d8",
"4139e3d2ea370d085e78025c2a9b36641c8ddc4e38919b7ae6260666d9c476eb",
"",
"",
"",
"",
"5d85399ada11cfc184f400ec46f2deba9f2a475e70e83d3c34e4eff5e33a3aae",
""];


// To prove that ed16 is in the block, we need 827f, 07f2, cf3e and 98da
let nodeArr2 = ["07f21a36e6044ac76e53708ee547d1ceee04daddb3240af9210fbfde37b44635",
"ed16c2e218daab8e00490e43ce64f1fa710568a80e12e263b12e78c729db9f24",
"827f775a9d16d60596e04da4b974ff5a531bd69b3d4b8593041119bb8eb5911b",
"",
"",
"cf3e5268687cd526a35ed6137f3a40f939111f42b28d81f08ccfbd5fc484ec8e",
"",
"98da26b66f0e0938dbabab0f6b854d36cdf7a3b7660791e2785b78da6f1944e3"];


function merkleCheck (nodeArr) {
  // convert hex to little-endian byte arrays
  let nodes = nodeArr.map(n => hexToByteArr(n).reverse());

  let r = doubleSha256(nodes.shift().concat(nodes.shift()));

  while(nodes.length) {
    if(nodes[0].length) {
      r = doubleSha256(nodes.shift().concat(r));
      nodes.shift();
    }
    else if(nodes[1].length) {
      nodes.shift();
      r = doubleSha256(r.concat(nodes.shift()));
    }
    else {
      r = doubleSha256(r.concat(r));
      nodes.splice(0,2);
    }
  }
  
  // convert back to big-endian hex
  r = byteArrToHex(r.reverse());

  console.log("merkle root: " + r);
}

merkleCheck(nodeArr1);
merkleCheck(nodeArr2);