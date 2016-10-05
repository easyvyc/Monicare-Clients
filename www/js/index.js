/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    
    main_url: "https://www.monicare.com/",
    deviceId: '',
    device: {},
    back_to_exit: false,
    dialog_opened: false,
    is_logged: false,
    viewPortWidth: 800,
    zoomsize: 1,
    current_date: {},
    session_id: '',
    
    pushbot_secret: '153e3a723356eb951f327428f5b5cd29',
    pushbot_id: '574d426e4a9efaef3a8b4567',
    pushbot_token: '',
    
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
        window.addEventListener("orientationchange", updateOrientation, true);
        
        window.addEventListener("resize", resize_event, false);

        document.addEventListener("showkeyboard", showkeyboard_event, false);
        document.addEventListener("hidekeyboard", hidekeyboard_event, false);        
        
        document.body.style.zoom = 1 / this.zoomsize;

        this.device = { platform: 1 };

        if(typeof(PushbotsPlugin) != 'undefined'){
            try{
                PushbotsPlugin.onNotificationClick(myMsgClickHandler);
                PushbotsPlugin.initializeAndroid(app.pushbot_secret, app.pushbot_id);
//            if (PushbotsPlugin.isiOS()) {
//                PushbotsPlugin.initializeiOS(app.pushbot_secret);
//                $('body').addClass('iphone');
//                this.device = { platform: 2 };
//            }
            
                PushbotsPlugin.getToken(function(tok){
                    app.pushbot_token = tok;
                });
            }catch(e){
                //app.appError(e.message);
            }
        }
        
        app.deviceId = device.platform + device.model + device.uuid;
        
        
	$('input,textarea,select').on('change', function(){
            $(this).removeClass('err');
            if($(this).attr('type')=='radio'){
               nm = $(this).attr('name');
               $("input[name=" + nm + "]").each(function(){
                   $(this).removeClass('err');
               });
            }
            //$(this).closest('label').removeClass('err');
	});
        
        $('input.phone').mask("(999) 999-9999");
        $('input.zipcode').mask("99999");
        
        document.addEventListener("backbutton", function(e){
            
            if(app.dialog_opened){
                app.close_dialog();
            }else{
                
                navigator.app.backHistory();
                var curr_hash = location.hash;
                                
                if(curr_hash == '' && !app.back_to_exit){
                    curr_hash = '#page_5290';
                    app.back_to_exit = true;
                }
                
                if(curr_hash != ''){
                    
                    if(start = curr_hash.indexOf("#page_")!=-1){
                        page_id = curr_hash.substring(start + 5);
                        app.loadPage("#menu_page_content", 'left', page_id);
                    }else{
                        app.loadPage(curr_hash, 'left'); 
                    }
                    
                }else{
                    navigator.app.exitApp();
                }
                
            }

               
        }, false);
        
        app.loadMenu();
        
        $('#home').on('click', function(){
            $('#top_navigation ul').slideDown(500);
        });
        
        $('body').on('click', function(e){
            if ($(e.target).parents('#top_navigation').size() > 0) {
                
            }else{
                $('#top_navigation ul').slideUp(500);
            }            
        });
        
        //$('#register .phone').val();
        
        $('a.nav_link').on('click', function(){
            app.click_nav_link($(this));
            return false;
        });
        
        $("#close-dialog").on('click', function(){
            app.close_dialog();
        });
        
        
        $('#login-form').on('submit', function(){
            
            app.startLoading();
            
            $.ajax({
                url: app.main_url + "app/auth/ajax_login",
                dataType: 'json',
                method: 'POST',
                data: $('#login-form').serialize() + '&device_id=' + app.deviceId + '&pushbot_token=' + app.pushbot_token,
            }).done(function(json) {
                try{
                    if(json.ok == 1 && json.role == 4){
                        
                        app.endLoading();
                        app.set_logged(json);
                        app.loadPage('#dashboard');
                        
                    }else{
                        app.endLoading();
                        if(json.error){
                            $('#login .error-msg').html(json.error);
                        }
                        app.show_msg("#login .error-msg");
                    }
                }catch(err) {
                    app.appError("Error: " + err.message);
                    app.endLoading();
                }
            }).fail(function(jqXHR, textStatus) {
                //console.log("error"); 
                app.appError("Connection lost.");
            });
            return false;
        });
        
        
        $('#forget-form').on('submit', function(){
            app.startLoading();
            $.ajax({
                url: app.main_url + "app/auth/ajax_forgot",
                dataType: 'json',
                method: 'POST',
                data: $('#forget-form').serialize()
            }).done(function(json) {
                try{
                    app.endLoading();
                    if(json.ok == 1){
                        //$('#forget .form').hide();
                        $('#forget .error-msg').hide();
                        $('.forget-success').html(json.msg);
                        app.show_msg(".forget-success");
                    }else{
                        if(json.error){
                            $('#forget .error-msg').html(json.error);
                        }
                        app.show_msg("#forget .error-msg");
                        $('.forget-success').hide();
                    }
                }catch(err) {
                    app.appError("Error: " + err.message);
                    app.endLoading();
                }
            }).fail(function(jqXHR, textStatus) {
                //console.log("error"); 
                app.appError("Connection lost.");
            }); 
            return false;            
        });
        
        
        var user_id = localStorage.getItem('user_id');
        if(user_id){
            app.loadUserById(user_id);
        }else{
            $pages.start();
        }
        
    },
    
    click_nav_link: function($obj){
      
        var title = $obj.attr('title');
        var pg = $obj.attr('href');
        var dir = $obj.attr('data-dir');
        var pg_id = $obj.attr('data-page_id');
        
        hash = pg.substring(0, 1);

        if(hash!='#'){
            app.loadPage("#menu_page_content", 'left', pg_id);
            window.history.pushState('', '', "#page_" + pg_id);
        }else{
            app.loadPage(pg, dir);
            window.history.pushState('', '', pg);
        }
        
    },
    
    loadPage:function(pg, dir){
        
        $('.app').hide();
        
        var ajax = true;
        
        if($(pg).size() > 0){
            ajax = false;
        }
        
        if(ajax){
            pg = pg.substring(1);
            args = false;
            if(arguments[2]){
                args = arguments[2];
            }
            
            $pages.load_html(pg, args);
            
        }else{
            $(pg).show("slide", { direction: (dir ? dir : "left") }, 1000);
        }
        
        $('#top_navigation ul').hide();
        
    },
    
    set_logged:function(json){
        if(typeof(json.user_data)=='undefined'){
            $.ajax({
                url: app.main_url + "app/auth/phonegap_auto_login",
                cache: false,
                method: "POST",
                dataType: "json",
                data: { user_id: json.user_id, device_id: app.deviceId, pushbot_token: app.pushbot_token },
                beforeSend:function(){
                },
                success: function(json){
                    if(json.role == 4){
                        app.set_logged(json);
                        app.loadPage('#dashboard');
                    }else{
                        app.loadPage('#login', 'left');
                    }
                    return true;
                }
            }).fail(function(jqXHR, textStatus) {
                //console.log("error"); 
                app.appError("Connection lost.");
            });
            
        }else{
            
            if(json.session_id){
                app.session_id = json.session_id;
            }
            
            localStorage.setItem('user_id', json.user_id);
            localStorage.setItem('user_name', json.user_name);
            localStorage.setItem('user_data', JSON.stringify(json.user_data));
            //$('#logged_as_name').html(json.user_name);

            $('body').removeClass('not-logged');
            $('body').addClass('user-logged');
            
            app.is_logged = true;
            
            try{
                if(typeof(PushbotsPlugin) != 'undefined'){
                    PushbotsPlugin.setAlias(json.user_name);
                }
            }catch(e){
                //app.appError(e.message);
            }

        }
        
    },
    
    loadUserById: function(user_id){
        // TODO: load user by id, patikrinti user agent visokie security ir t.t. 
       
        $.ajax({
            url: app.main_url + "app/auth/phonegap_auto_login",
            cache: false,
            method: "POST",
            dataType: "json",
            data: { user_id: user_id, device_id: app.deviceId },
            beforeSend:function(){
                app.startLoading();
            },
            success: function(json){
                app.endLoading();
                if(json.role == 4){
                    app.set_logged(json);
                    app.loadPage('#dashboard', 'left');
                }else{
                    app.loadPage('#login', 'left');
                }
                return true;
            }
        }).fail(function(xhr, status, error) {
            //console.log("error"); 
            app.appError("Connection lost.");
            app.loadPage('#login', 'left');
        });
            
        return false;
    },
    
    logout: function(){
      
        app.startLoading();

        $.ajax({
            url: app.main_url + "app/auth/ajax_logout",
            method: 'GET',
        }).done(function() {

            app.endLoading();

            $('body').removeClass('user-logged');
            $('body').removeClass('oncall');
            $('body').addClass('not-logged');

            app.loadPage('#login', 'left');

            app.is_logged = false;

            localStorage.clear();

        }).fail(function(jqXHR, textStatus) {
            //console.log("error"); 
            app.appError("Connection lost.");
        });            
        
        
    },

    expandMenu: function(){
        $('#top_navigation ul').slideDown(500);
        setTimeout(function(){ $('#top_navigation ul').slideUp(500); }, 3000);
    },

    loadMenu: function(){

        $.ajax({
            url: app.main_url + "app/family_mobapp/get_menu",
            method: 'GET',
            dataType: 'json'
        }).done(function(json) {

            $menu = $("#top_navigation ul");
            for(i = 0; i < json.length; i++){
                $li = $('<li></li>');
                $li.html("<a href='" + json[i].page_url + "' data-page_id='" + json[i].record_id + "'><span>" + json[i].title + "</span></a>");
                $menu.append($li);
            }
            
            $('a', $menu).click(function(){
                pg_url = $(this).attr('href');
                pg_id = $(this).attr('data-page_id');
                app.loadPage("#menu_page_content", 'left', $(this).attr('data-page_id'));
                window.history.pushState('', '', "#page_" + pg_id);
                return false;
            });
            
            app.expandMenu();

        }).fail(function(jqXHR, textStatus) {
            //console.log("error"); 
            app.appError("Connection lost.");
        });            
        
    },
    
    show_msg:function(target){
        $(target).show();
        setTimeout(function() { $(target).hide('blind', {}, 1000) }, 7000);
    },
    
    calculate_dialog_position:function(){
        var dialog_height = $( "#dialogPage" ).height();
        var dialog_inner_height = $( "#dialogPage .ui-content" ).height();
        var window_height = parseInt($( window ).height()) * this.zoomsize;
        var max_dialog_height = window_height - 20;
        
        if(dialog_inner_height > dialog_height){
            
        }
        
        if(dialog_height > max_dialog_height){
            $("#dialogPage").height(max_dialog_height);
            dialog_height = max_dialog_height;
        }
        
        var dialog_top_pos = parseInt((window_height - dialog_height) / 2);
        
        $( "#dialogPage" ).css({'top': dialog_top_pos + 'px'});
    },
    
    open_dialog:function(title, content){
        
        $( "#dialogPage .ui-title" ).html(title);
        $( "#dialogPage .ui-content" ).html(content);
        
        $('.overlay').show();
        $( "#dialogPage" ).show();
        
        this.dialog_opened = true;
        
        //window.history.pushState('', '', '#dialog');
        
        this.calculate_dialog_position();
        //alert(content);
    },

    close_dialog:function(){
        
        $('.overlay').hide();
        $( "#dialogPage" ).hide();
        
        this.dialog_opened = false;
        
    },
    
    startLoading: function(){
        $('#loading').show();
    },
    
    endLoading: function(){
        $('#loading').hide();
    },
        
    appError:function(message){
        //$('#empty_page [data-role=content]').html("<p class='error-msg'>" + message + "</p>")
        alert(message);
        this.endLoading();
    },    
    onDeviceOffline: function(){
        this.appError("Connection lost.");
    },
    
};

app.initialize();