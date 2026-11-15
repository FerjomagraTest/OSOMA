/**
 * @author Dimas Gustavo amadeusc2@gmail.com
 * @version 1.0
 */
 $(function() {

    var _base = {
      init : function(){
          _base.search();
      },
      search :  function() {

        $('#search').on('keyup', function(){
          var search = $.trim($(this).val());
            if(search.length > 0) {
                $('#SearchHeaderNotice').hide();
                $('#content-search-header').show();

                var action = $(this).attr('data-source');
                var type = $('#selectSearch').val(); //antes: selectSearch
                var dataString = 'search=' + search + '&type=' + type ;
                
                console.log('acción: '+action)
                console.log('type: '+type) 
                console.log('dataString: '+dataString)
                console.log('search: '+search)

                $.ajax({
                  type: "POST",
                  url: action,
                  data: dataString,
                  dataType: 'json',
                  success: function(result){
                    console.log(result);

                    if(result.state == 1){
                        var data = result.data;
                        console.log(data)

                        $('#content-search-header').html('');

                        if(data.length){
                            data.map(function(item){
                              console.log('4')
                              var html = '';
                              
                              html += '<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12 globo">'
                                html += '<div class="product_results">'
                                  
                                  html += '<div class="example_pic" style="background-image: url('+item.imgProductos+');">'
                                    
                                    html += '<div class="info">'
                                    
                                      html += '<div class="text2" style="width:100%;">'
                                        html += '<a href="/Osoma/midocumento/'+item._id+'">'
                                          html += '<button style="color:#00cc7a; background:white;">Ver más'
                                            html += '<img class="right_arrow" src="/images/restrictedProducts/green_arrow.png">'
                                          html += '</button>'
                                        html += '</a>'
                                      html += '</div>'
                                    html += '</div>'
                                  html += '</div>'

 
                                  html += '<div class="font">'
                                    html += '<h3 class="text_font">'+item.nombre+'</p>'
                                  html += '</div>'
                                html += '</div>'
                              html +=  '</div>'
                              

                                  
                                
                            $('#content-search-header').append(html);
                            

                          });

                        }
                    }else{
                        console.log('no se pudo redirigir');
                    }
                  }
                });
            } else {
                $('#content-search-header').hide();
            }
          
        });
      }
    };

    _base.init();
})