(function(window){
	function TrainingSignal(dim) {
		this.X = [];
		this.t = [];
		var dim = dim;
		var cnt = [];

		this.addData = function(vec,t){
			this.X.push(vec);
			this.t.push(t);
			cnt = uniq(this.t);
		};

		this.clearData = function(){
			delete this.X;
			this.X = [];
			delete this.t;
			this.t = [];

			cnt = [];
		};

		this.getDataLength = function(){
			return this.X.length;
		};

		this.getDim = function(){
			return dim;
		};

		this.isValid = function(){
			if(cnt.length==dim) return true;
			else return false;
		};

		function uniq(arr) {
			var o = {};
			var r = [];
			for (var i = 0;i < arr.length;i++)
				if (arr[i] in o? false: o[arr[i]] = true)
					r.push(arr[i]);
			return r;
		}
	}


	window.TrainingSignal = TrainingSignal;
	
})(window);
