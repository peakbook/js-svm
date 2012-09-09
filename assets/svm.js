(function(window){

	function SVM() {
		var step = 100 | 0;
		var eta = 0.05;
		var dalpha=0.0;
		var error = 1.0e-8;

		var t = new Array();
		var X = new Array();
		this.w = new Array();
		this.alpha = new Array();
		this.h = 0.0;
		this.kernel = this.innerproduct;
		this.end = false;

		this.C = 2000.0;
		this.gamma = 25;

		this.setKernel = function(kerneltype)
		{
			switch(kerneltype)
			{
				case 0:
					this.kernel = this.innerproduct;
					break;
				case 1:
					this.kernel = this.gaussian;
					break;
				default:
					this.kernel = this.innerproduct;
					break;
			}
			this.end = false;
		};

		this.normalizeLagrangian = function()
		{
			var num = 0 | 0;
			var tmp = 0.0;

			var i;
			var j = this.alpha.length;

			for(i=0;i<j;i++)
			{
				if(this.alpha[i] > 0) num++;
				tmp += this.alpha[i]*t[i];
			}
			tmp /= num;

			for(i=0;i<j;i++)
			{
				this.alpha[i] -= tmp * t[i];
				if(this.alpha[i] > this.C) this.alpha[i] = this.C;
				else if(this.alpha[i] < 0) this.alpha[i] = 0;
			}
		};

		this.setTrainingData = function(data)
		{
			this.end = false;
			this.w.length = data.getDim();
			this.alpha.length = data.getDataLength();

			X = data.X;
			t = data.t;

			for (var i=0; i < this.alpha.length; i++) {
				this.alpha[i] = 1.0;
			}
			this.normalizeLagrangian();
		};

		this.addTrainingData = function(data)
		{
			var idx = this.alpha.length;
			this.end = false;
			this.alpha.length = data.getDataLength();
			X = data.X;
			t = data.t;

			for (var i=idx; i < this.alpha.length; i++) {
				this.alpha[i] = 1.0;
			}
			this.normalizeLagrangian();
		};

		this.learning = function()
		{
			var i,j,k;
			var dalpha_tmp = 0.0;
			var alpha_tmp = new Array();

			this.w.length = X[0].length;
			this.alpha.length = X.length;

			for(k=0;k<step;k++)
			{
				for(j=0;j<this.alpha.length;j++)
				{
					var tmp = 0.0;
					for(i=0;i<this.alpha.length;i++)
					{
						if(this.alpha[i]>0 ) 
							tmp -= this.alpha[i] * t[i] * t[j]*this.kernel(X[i],X[j]);
					}
					tmp += 1.0;
					dalpha_tmp += Math.abs(tmp);
					alpha_tmp[j] = this.alpha[j] + eta*tmp;
				}
				dalpha_tmp /= this.alpha.length;
				if(Math.abs(dalpha - dalpha_tmp) < error)
				{
					this.end = true;
				}
				dalpha = dalpha_tmp;

				for(i=0;i<this.alpha.length;i++)
				{
					this.alpha[i] = alpha_tmp[i];
				}
				
				this.normalizeLagrangian();
			}

			for(j=0;j<this.w.length;j++)
			{
				this.w[j] = 0;
				for(i=0;i<this.alpha.length;i++)
				{
					if(this.alpha[i] > 0)
					{
						this.w[j] += this.alpha[i] * t[i] * X[i][j];
					}
				}
			}

			this.h=0.0;k=0;
			for(i=0;i<this.alpha.length;i++)
			{
				if(this.alpha[i] > 0)
				{
					this.h += this.kernel(this.w,X[i]) - t[i];
					k++;
				}
			}
			this.h /= k;
		};

		this.eval = function(x)
		{
			var tmp = 0.0;

			for(var i=0;i<t.length;i++)
			{
				if(this.alpha[i] > 0) tmp += this.alpha[i]*t[i]*this.kernel(X[i],x);
			}
			tmp -= this.h;

			return tmp;
		};


		this.gaussian = function(a,b)
		{
			return Math.exp(-this.gamma*(norm2(a,b))); 
		};

		this.innerproduct = function(a,b)
		{
			var tmp = 0.0;
			for(i=0;i<a.length;i++)
			{
				tmp += a[i] * b[i];
			}
			return tmp;
		};

		function sign(n)
		{
			return (n<0)? -1:1; 
		}

		function norm2(a,b)
		{
			var tmp = 0.0;
			for(i=0;i<a.length;i++)
			{
				tmp += Math.pow(a[i] - b[i],2);
			}
			return tmp;
		}

		function ave(arr)
		{
			var sum = 0.0;
			for(var i=0,j=arr.length;i<j;i++)
			{
				sum += arr[i];
			}
			return sum/arr.length;
		}
	}

	window.SVM = SVM;

})(window);
