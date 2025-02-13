export const campaign = {
    data: function() {
        return {
          parent: "",
          data: {},
          details: {},
          date: "",
          date2: "",
          q: "",
          sort: "",
          loader: 1,
          iChart: -1,
          id: 0,
          type: 0,
          all: true
        }
      },
      mounted: function() {
        this.parent = this.$parent.$parent;
        if (!this.parent.user) {
          this.parent.logout();
        }
        this.get();
        this.GetFirstAndLastDate();
      },
      methods:{
        GetFirstAndLastDate: function() {
            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            var firstDayOfMonth = new Date(year, month, 2);
            var lastDayOfMonth = new Date(year, month + 1, 1);

            this.date = firstDayOfMonth.toISOString().substring(0, 10);
            this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
        },
        get: function() {
            var self = this;
            var data = self.parent.toFormData(self.parent.formData); 
            if (this.date != "") data.append('date', this.date);
            if (this.date2 != "") data.append('date2', this.date2);
            data.append('id', this.parent.$route.params.id);
            self.loader = 1;
            axios.post(this.parent.url+"/site/getBanners?auth=" + this.parent.user.auth, data).then(function(response) {
                self.loader=0;
                self.data = response.data;
                document.title=self.data.info.title;
                if(self.iChart!=-1) self.line(self.data.items[self.iChart]);
              })
              .catch(function(error) {
                self.parent.logout();
              });
        },
        getDetails: function(bid=false, type=false) {
            this.details = {};
            if(bid) this.id=bid;
            if(type) this.type=type;
            if(this.id) bid=this.id;
            if(this.type) type=this.type;
            var self = this;
            var data = self.parent.toFormData(self.parent.formData);
            if(this.date!="") data.append('date', this.date);
            if(this.date2!="") data.append('date2', this.date2);
            if(this.q!="") data.append('q', this.q);
            if(this.sort!="") data.append('sort', this.sort);
            if(bid!="") data.append('bid', bid);
            if(type!="") data.append('type', type);
            self.loader=1;
            axios.post(this.parent.url+"/site/getStatisticsDetails?auth="+this.parent.user.auth, data).then(function(response) {
              self.details = response.data;
              self.loader = 0;
            }).catch(function(error) {
              self.parent.logout();
            });
        },
        action: function() {
            var self = this;
            var data = self.parent.toFormData(self.parent.formData);

            axios.post(this.parent.url+"/site/actionCampaign?auth=" + this.parent.user.auth, data).then(function(response) {
                self.$refs.new.active = 0;
                if(response.data.error){
                    self.$refs.header.$refs.msg.alertFun(response.data.error);
                }
                else if (self.parent.formData.id) {
                  self.$refs.header.$refs.msg.successFun("Successfully updated campaign!");
                } else {
                  self.$refs.header.$refs.msg.successFun("Successfully added new campaign!");
                }

                self.get();
              })
              .catch(function(error) {
                console.log('errors: ', error);
              });
        },
        actionAd: function() {
            var self = this;
            self.parent.formData.copy = "";
            var data = self.parent.toFormData(self.parent.formData);
            data.append('campaign', this.parent.$route.params.id);
            axios.post(this.parent.url+"/site/actionBanner?auth=" + this.parent.user.auth, data).then(function(response) {
                self.$refs.ad.active = 0;
                if(response.data.error){
                    self.$refs.header.$refs.msg.alertFun(response.data.error);
                }
                else if(self.parent.formData.id) {
                  self.$refs.header.$refs.msg.successFun("Successfully updated banner!");
                } else {
                  self.$refs.header.$refs.msg.successFun("Successfully added new banner!");
                }
                self.get();
              })
              .catch(function(error) {
                console.log('errors', error);
              });
        },
        delAd:async function() {
            if (await this.$refs.header.$refs.msg.confirmFun("Please confirm next action", "Do you want to delete this banner?")) {
              var self = this;
              var data = self.parent.toFormData(self.parent.formData);

              axios.post(this.parent.url+"/site/deleteBanner?auth=" + this.parent.user.auth, data).then(function(response) {
                if(response.data.error){
                    self.$refs.header.$refs.msg.alertFun(response.data.error);
                }
                else{
                self.$refs.header.$refs.msg.successFun("Successfully deleted banner!");
                self.get();
                }
              }).catch(function(error) {
                  console.log('errors: ', error);
              });
            }
        },
        line:function(item) {
            setTimeout(function(){
              let dates = [];
              let clicks = [];
              let views = [];
              let leads = [];
              if(item && item['line']){
                for(let i in item['line']){
                  dates.push(i);
                  //if(item[i].include=='true'){
                    clicks.push(item['line'][i].clicks);
                    views.push(item['line'][i].views);
                    leads.push(item['line'][i].leads);
                  //}
                }
              }
              document.getElementById('chartOuter').innerHTML = '<div id="chartHints"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div><canvas id="myChart"></canvas></div>'
              const ctx = document.getElementById('myChart');
              const xScaleImage = {
                id:"xScaleImage",
                afterDatasetsDraw(chart,args,plugins){
                  const {ctx,data, chartArea:{bottom}, scales:{x}} = chart;
                  ctx.save();
                  data.images.forEach((image,index) => {
                    const label = new Image();
                    label.src = image;

                    const width = 120;
                    ctx.drawImage(label,x.getPixelForValue(index)-(width/2 ),x.top,width,width);
                  });
                }
              }
              new Chart(ctx, {
                type:'line',
                // plugins:[xScaleImage],

                data: {
                  labels: dates,
                  // images: images,
                  datasets: [
                    {
                      label: "Clicks",
                      backgroundColor: "#00599D",
                      borderColor: "#00599D",
                      data: clicks
                    },
                    {
                      label: "Views",
                      backgroundColor: "#5000B8",
                      borderColor: "#5000B8",
                      data: views,
                      yAxisID: 'y2'
                    },
                  ]
                },
                options: {
                  responsive: true,
                  plugins:{
                    tooltip: {
                      bodyFontSize: 20,
                      usePointStyle:true,
                      callbacks: {
                        title: (ctx) => {
                          return ctx[0]['dataset'].label
                        },
                      }
                    },
                    legend:{
                      display:false
                    }
                  },
                  categoryPercentage: 0.2,
                  barPercentage: 0.8,
                  scales:{
                    y:{
                      id: 'y2',
                      position: 'right'
                    },
                    x:{
                      afterFit: (scale) => {
                        scale.height = 120;
                      }
                    }
                  }
                },
              });
            },100);
        },
        checkAll: function(prop) {
            if (this.data.items[this.iChart].sites) {
              for (let i in this.data.items[this.iChart].sites) {
                this.data.items[this.iChart].sites[i].include = prop;
              }
            }

            this.parent.formData = this.data.items[this.iChart];
            this.get();
        }
      },
      template: `
    <div class="inside-content">
      <Header ref="header" />
      <div id="spinner" v-if="loader"></div>
      <div class="panelTop">
            <div class="wrapper">
                <div class="flex max-width-pannel">
                  <div class="pannel">
                      <div class="w30 ptb30 text-start">
                        <h1 v-if="data && data.info">{{data.info.title}}</h1>
                      </div>
                      <div class="w50"></div>
                      <div class="w20 ptb20 text-end">
                          <a class="btnS" href="#" @click.prevent="parent.formData=data.info;$refs.new.active=1"><i class="fas fa-edit"></i> Edit campaign</a>
                      </div>
                   </div>
                    
                </div>
            </div>
            <popup ref="chart" fullscreen="true" title="Chart">
                <div class="flex pannel">
                    <div class="w30 ptb25">
                        <input type="date" v-model="date" @change="get();"/> - <input type="date" v-model="date2" @change="get();"/>
                    </div>
                    <div class="w70 text-start">
                        <div class="flex cubes">
                            <div class="w30 clicks">
                                <div>Clicks</div>
                                {{data.items[iChart].clicks}}
                            </div>
                            <div class="w30 views">
                                <div>Views</div>
                                {{data.items[iChart].views}}
                            </div>
                            <div class="w30 leads">
                                <div>Leads</div>
                                {{data.items[iChart].leads}}
                            </div>
                            <div class="w30 ctr">
                                <div>CTR</div>
                                {{(data.items[iChart].clicks*100/data.items[iChart].views).toFixed(2)}} %
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex body">
                    <div class="w30 ar filchart">
                        <div class="itemchart ptb10" v-if="all">
                            <toogle v-model="all" @update:modelValue="all = $event;checkAll($event)" />
                            All
                        </div>
                        <div class="itemchart ptb10" v-if="data.items[iChart].sites" v-for="s in data.items[iChart].sites">
                            <toogle v-model="s.include" @update:modelValue="s.include = $event;parent.formData = data.items[iChart];get()" />
                            {{s.site}}
                        </div>
                    </div>
                    <div class="w70" id="chartOuter">
                        <div id="chartHints">
                        <div class="chartHintsViews">Views</div>
                        <div class="chartHintsClicks">Clicks</div>
                        </div>
                        <canvas id="myChart"></canvas>
                    </div>
                </div>
            </popup>
            <popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit campaign' : 'New campaign'">
                <div class="inner-form2">
                <form @submit.prevent="action()" v-if="parent.formData">
                    <div class="row">
                    <label>Name</label>
                    <input type="text" v-model="parent.formData.title" required>
                    </div>
                    
                    <div class="row">
                    <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
                    <button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
                    </div>
                </form>
                </div>
            </popup>
      </div>
      <div class="wrapper">
          <div class="flex max-width-pannel">
            <div class="pannel">
                <div class="w20 ptb30 text-start">
                    <h2>Ads</h2>
                </div>
                <div class="w60 ptb20 ac1"><div class="ac"><input type="date" v-model="date" @change="get()" /> - <input type="date" v-model="date2" @change="get()" /></div></div>
                <div class="w20 ptb20 text-end">
                    <a class="btnS" href="#" @click.prevent="parent.formData={};$refs.ad.active=1"><i class="fas fa-plus"></i> New</a>
                </div>
            </div>
          </div>
          <popup ref="ad" :title="(parent.formData && parent.formData.id) ? 'Edit banner' : 'New banner'">
            <div class="inner-form2">
              <form @submit.prevent="actionAd()" v-if="parent.formData">
                <div class="row">
                  <label>Link</label>
                  <input type="text" v-model="parent.formData.link" required>
                </div>
                <div class="row">
                  <label>Description</label>
                  <input type="text" v-model="parent.formData.description" required>
                </div>
                <div class="row">
                  <label>Type</label>
                  <select v-model="parent.formData.type" required>
                    <option value="0">---</option>
                    <option v-if="data.types" v-for="c in data.types" :value="c.id">{{c.title}}</option>
                  </select>
                </div>
                <div class="row">
                  <label>Image</label>
                  <Image v-module="parent.formData.img" @update:modelValue="parent.formData.img = $event;" />
                </div>
                <div class="row">
                  <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
                  <button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
                </div>
              </form>
            </div>
          </popup>
          
          <!--<popup ref="details" fullscreen="true" title="Details">
              <div class="flex pannel">
                  <div class="w60">
                      <input type="text" placeholder="Search..." v-model="q" @keyup="getDetails()"/> <input type="date" v-model="date" @change="get();"/> - <input type="date" v-model="date2" @change="get();"/>
                  </div>
                  <div class="w40 al">
                  </div>
              </div>
              <br>
              <div class="table">
                <table v-if="details!=''">
                    <thead>
                        <tr>
                            <th class="id">#</th>
                            <th>Type</th>
                            <th>
                                IP
                                <i class="fas fa-caret-up" @click="sort='s.ip';getDetails();" v-if="sort==''"></i>
                                <i class="fas fa-caret-down" @click="sort='';getDetails();" v-if="sort=='s.ip'" :class="{green:sort=='s.ip'}"></i>
                            </th>
                            <th class="id">Date</th>
                            <th class="id">Site</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,i) in details">
                            <td class="id">{{item.id}}</td>
                            <td>
                                <template v-if="item.type==1">Views</template>
                                <template v-if="item.type==2">Clicks</template>
                                <template v-if="item.type==3">Leads</template>
                            </td>
                            <td>
                                {{item.ip}}
                            </td>
                            <td>
                                {{item.date}}
                            </td>
                            <td>
                                {{item.site}}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="empty" v-if="details==''">
                    No items
                </div>
            </div>
          </popup>-->
          <div class="table" v-if="date.items!=''">
              <table>
                  <thead>
                      <tr>
                          <th class="id">#</th>
                          <th class="id"></th>
                          <th class="image"></th>
                          <th>Size</th>
                          <th>Link</th>
                          <th class="id">Views</th>
                          <th class="id">Clicks</th>
                          <th class="id">Leads</th>
                          <th class="id">Fraud clicks</th>
                          <th class="actions">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item,i) in data.items">
                          <td class="id">{{item.id}}</td>
                          <td class="id">
                            <toogle v-model="item.published" @update:modelValue="item.published = $event;parent.formData = item;actionAd()"/>
                          </td>
                          <td class="image">
                            <a href="#" @click.prevent="parent.formData = item;$refs.ad.active=1;">
                                <img :src="this.parent.url+'/'+item.img" />
                            </a>
                          </td>
                          <td class="image">
                            <a href="#" @click.prevent="parent.formData = item;$refs.ad.active=1;">
                                {{item.size}}
                            </a>
                          </td>
                          <td class="table-link">
                            <a href="#" @click.prevent="parent.formData = item;$refs.ad.active=1;">
                                {{item.link}}
                            </a>
                          </td>
                          <td class="id">
                              <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,1)">
                                  {{item.views}}
                              </a>
                          </td>
                          <td class="id">
                              <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,2)">
                                  <template v-if="item.clicks">{{item.clicks}}</template>
                                  <template v-if="!item.clicks">0</template>
                              </a>
                          </td>
                          <td class="id">
                              <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,3)">
                                  <template v-if="item.leads">{{item.leads}}</template>
                                  <template v-if="!item.leads">0</template>
                              </a>
                          </td>
                          <td class="id">
                              <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,4)">
                                  <template v-if="item.fclicks">{{item.fclicks}}</template>
                                  <template v-if="!item.fclicks">0</template>
                              </a>
                          </td>
                          <td class="actions">
                              <a href="#" @click.prevent="parent.formData = item;$refs.ad.active=1;">
                                  <i class="fas fa-edit"></i>
                              </a>
                              <a href="#" @click.prevent="parent.formData = item;iChart = i;$refs.chart.active=1;line(item)">
                                  <i class="fas fa-chart-bar"></i>
                              </a>
                              <a href="#" @click.prevent="parent.formData = item;delAd();">
                                  <i class="fas fa-trash-alt"></i>
                              </a>
                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>
            <div class="empty" v-if="data.items==''">
                No items
            </div>
        </div>
    </div>
`};