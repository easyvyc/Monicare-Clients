var $pages = {
    
    start: function(){
        this.load_page_by_id(5290);
    },
    
    load_page_by_url:function(url){
        
    },
    
    load_page_by_id:function(id){

        $pg = this;

        content = localStorage.getItem('page_' + id);
        if(content && false){
            
            $pg.adjust_page(content);
            
        }else{

            $.ajax({
                url: app.main_url + "app/family_mobapp/page/" + id,
                cache: false,
                method: "GET",
                dataType: "html",
                beforeSend:function(){
                    app.startLoading();
                },
                success: function(content){
                    app.endLoading();
                    localStorage.setItem('page_' + id, content);
                    $pg.adjust_page(content);
                    
                    $('a', $("#page_content_html")).each(function(){
                        //alert($(this).attr('data-page_id'));
                        if($(this).attr('data-page_id')){
                            $(this).removeAttr('href');
                            $(this).click(function(){
                                $pg.load_page_by_id($(this).attr('data-page_id'));
                                //return false;
                            });
                        }else{
                            link = $(this).attr('href');
                            $(this).removeAttr('href');
                            //$pg.load_page_by_url(link);
                        }
                    });
                    
                    return true;
                }
            }).fail(function(jqXHR, textStatus) {
                //console.log("error"); 
                app.appError("Connection lost.");
            });            
            
        }

    },
    
    load_html:function(page){
        var method = "GET";
        var args = false;
        if(arguments[1]){
            method = "POST";
            argss = arguments[1];
            if(typeof(args)!='object'){
                args = {data: argss};
            }
        }
        
        $pg = this;

        $.ajax({
            url: app.main_url + "app/family_mobapp/" + page,
            cache: false,
            method: method,
            data: args,
            dataType: "html",
            beforeSend:function(){
                app.startLoading();
            },
            success: function(content){
                app.endLoading();
                $pg.adjust_page(content);
                return true;
            },
            error: function(jqXHR, textStatus, error){
                //app.appError(jqXHR.readyState + " " + jqXHR.status + " " + jqXHR.statusText + " " + jqXHR.statusCode());
            }
        }).fail(function(jqXHR, textStatus, error) {
            
            $pg.start();
            
            //console.log("error"); 
            //app.appError("Connection lost. " + jqXHR.readyState + " " + jqXHR.status + " " + jqXHR.statusText + " " + jqXHR.statusCode());
        });
    },
    
    adjust_page:function(content){
        
        $("#page_content_html").html(content);
        $("#page_content").show("slide", { direction: "left" }, 1000);
        
        $('input.phone', $("#page_content_html")).mask("(999) 999-9999");
        $('input.zipcode', $("#page_content_html")).mask("99999");

        $('a.nav_link', $("#page_content_html")).on('click', function(){
            app.click_nav_link($(this));
            return false;
        });

        $('input,textarea,select', $("#page_content_html")).on('change', function(){
            $(this).removeClass('err');
            if($(this).attr('type')=='radio'){
               nm = $(this).attr('name');
               $("input[name=" + nm + "]").each(function(){
                   $(this).removeClass('err');
               });
            }
            //$(this).closest('label').removeClass('err');
        });
        
    }
    
}