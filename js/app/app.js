import {router} from './router.js';
import {msg} from './widgets/msg.js';
import {popup} from './widgets/popup.js';
import {header} from './widgets/header.js';
import { toogle } from './widgets/toogle.js';
import { img } from './widgets/img.js';

document.addEventListener('DOMContentLoaded', function(){
    const main = {
        data() {
            return {
                url:"https://affiliate.yanbasok.com",
                user: {name:"", phone:"", email:"", date:"", auth:""},
                formData:{},
                title:"",
                date:"",
                time:"",
            }
        },      
        watch:{
            $route:function(){
                this.init();
            }
        },
        mounted:function(){
            this.init();
        },
        methods:{
            init(){
                var self = this;
                if (window.localStorage.getItem('user')) self.user = JSON.parse(window.localStorage.getItem('user'));

                router.isReady().then(() => {
                    if(window.localStorage.getItem("user")){
                        self.user= JSON.parse(window.localStorage.getItem("user"));
                        if (self.$route['path']=='/' && self.user.type=='admin'){
                            self.page('/campaigns');
                        }else if(['/campaigns','/campaign', '/users', '/user'].includes (self.$route['path']) && self.user.type!='admin'){
                            self.page('/statistics');
                        }else if(['/statistics','/payments','/sites'].includes (self.$route ['path']) && self.user.type=='admin'){
                            self.page('/campaigns');
                        }else if(['/campaigns','/campaign', '/users','/user', '/statistics','/payments','/sites'].includes(self.$route ['path']) && self.user.type=='admin'){
                            self.page();
                        }else if(!['/campaigns','/campaign','/users','/user','/statistics','/payments', '/sites'].includes (self.$route ['path']) && self.user.type=='admin'){
                            self.page();
                        }
                    }else{
                        self.page('/');
                    }
                });
            },
        logout(){
            this.user = {name:"", phone:"", email:"", date:"", auth:""};
            this.page('/');
            window.localStorage.setItem('user','');
        },
        page: function (path=""){
            this.$router.replace(path);
            this.title=this.$route['name'];
            document.title=this.$route ['name'];
        },
        toFormData:function(obj) {
            var fd = new FormData();

            for (var x in obj) {
              if (typeof obj[x] === 'object' && x !== 'img' && x !== 'copy') {
                for (var y in obj[x]) {
                  if (typeof obj[x][y] === 'object') {
                    for (var z in obj[x][y]) {
                      fd.append(x+'['+y+']['+z+']', obj[x][y][z]);
                    }
                  } else {
                    fd.append(x+'['+y+']', obj[x][y]);
                  }
                }
              } else if (x != 'copy') {
                fd.append(x, obj[x]);
              }
            }

            return fd;
          }
        }
      };
    
    var app = Vue.createApp(main)
    .component('Header',header)
    .component('popup',popup)
    .component('msg',msg)
    .component('Image',img)
    .component('toogle',toogle)
    .use(router)
    .mount('#content')
});
