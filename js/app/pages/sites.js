export const sites = {
    data:function() {
        return {
            parent:"",
            data:{},
            date:"",
            date2:"",
            loader:1,
        }
    },
    mounted:function(){
        this.parent = this.$parent.$parent;

        if(!this.parent.user){
            this.parent.logout();
        }
        this.get();
        this.GetFirstAndLastDate();
    },
    methods: {
        GetFirstAndLastDate: function() {
            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            var firstDayOfMonth = new Date(year, month, 2);
            var lastDayOfMonth = new Date(year, month + 1, 1);

            this.date = firstDayOfMonth.toISOString().substring(0, 10);
            this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
        },
        get:function(){
            var self = this;
            var data = self.parent.toFormData(self.parent.formData);

            data.append('uid', this.parent.user.id);
            if (this.date != "") data.append('date', this.date);
            if (this.date2 != "") data.append('date2', this.date2);
            if(this.type!="") data.append('type',this.type);
            self.loader=1;
            axios.post(this.parent.url+"/site/getSites?auth="+this.parent.user.auth,data).then(function(response){
                self.loader=0;
                self.data = response.data;
            }).catch(function(error){
                self.parent.logout();
            });
        },
        action: function() {
            var self = this;
            var data = self.parent.toFormData(self.parent.formData);

            axios.post(this.parent.url+"/site/actionSite?auth=" + this.parent.user.auth, data).then(function(response) {
                if(response.data.error){
                    self.$refs.header.$refs.msg.alertFun(response.data.error);
                    return false;
                }else{
                    // self.$refs.new.active=0;
                }

                if (self.parent.formData.id) {
                  self.$refs.header.$refs.msg.successFun("Successfully updated site!");
                } else {
                  self.$refs.header.$refs.msg.successFun("Successfully added new site!");
                }

                self.get();
              })
              .catch(function(error) {
                console.log('errors: ', error);
              });
        },
        copy:async function(text) {
          if(navigator && navigator.clipboard){
            await navigator.clipboard.writeText(text);
            this.$refs.header.$refs.msg.successFun("Successfully copied!");
            this.$refs.copy.active=0;
            this.parent.formData={};
          }else{
            this.$refs.header.$refs.msg.alertFun("Use https!");
          }
        },
    },
    template:`
    <div class="inside-content">
        <Header ref="header"/>
        <div id='spinner' v-if="loader"></div>
        <div class="wrapper">
            <div class="flex max-width-pannel">
                <div class="pannel">
                    <div class="w20 ptb30 text-start">
                        <h1>Sites</h1>
                    </div>
                    <div class="w60 ptb20 ac">
                        <input type="date" v-model="date" @change="get()" /> - <input type="date" v-model="date2" @change="get()" />
                    </div>
                    <div class="w20 ptb20 text-end">
                    </div>
                </div>
            </div>
            <popup ref="copy" :title="'Copy banner'">
                <div class="inner-form2">
                    <form v-if="parent.formData">
                        <div class="row">
                            <label>Code</label>
                            <textarea v-model="parent.formData.copy"></textarea>
                        </div>
                        <div class="row">
                            <button class="btn" @click.prevent="copy(parent.formData.copy)">Copy code</button>
                        </div>
                    </form>
                </div>
            </popup>
            <div class="table" v-if="data.items!=''">
                <table>
                    <thead>
                        <tr>
                            <th class="id"></th>
                            <th class="image">Site</th>
                            <th>Link</th>
                            <th class="id">Views</th>
                            <th class="id">Clicks</th>
                            <th class="id">Leads</th>
                            <th class="id">Fraud clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.items">
                            <td class="id">
                                <toogle v-model="item.published" @update:modelValue="item.published = $event;parent.formData = item;action()"/>
                            </td>
                            <td class="image">
                                {{item.site}}
                            </td>
                            <td class="id">
                                {{item.views}}
                            </td>
                            <td class="id">
                                <template v-if="item.clicks">{{item.clicks}}</template>
                                <template v-if="!item.clicks">0</template>
                            </td>
                            <td class="id">
                                <template v-if="item.leads">{{item.leads}}</template>
                                <template v-if="!item.leads">0</template>
                            </td>
                            <td class="id">
                                <template v-if="item.fclicks">{{item.fclicks}}</template>
                                <template v-if="!item.fclicks">0</template>
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