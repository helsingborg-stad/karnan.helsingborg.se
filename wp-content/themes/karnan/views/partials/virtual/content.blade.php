<div class="grid-lg-7">
    <div class="grid">
		<div class="grid-md-12">
			<article>
		        <h2>{{ $section['section_title'] }}</h2>
		        {!! $section['content_guide'] !!}
		    </article>
		</div>

	    @if(!empty($section['google_maps']))
	        <div class="grid-md-12 gutter gutter-vertical gutter-margin">
	            <a href="#modal-target-{{ $elevatorKey }}" class="btn btn-block btn-primary"><i class="pricon pricon-compass"></i> <?php _e('Open virtual map', 'karnan'); ?></a>
	                <div id="modal-target-{{ $elevatorKey }}" class="modal modal-backdrop-white modal-medium" tabindex="-1" role="dialog" aria-hidden="true">
	                <div class="modal-content material-shadow-lg">
	                    <div class="modal-header">
	                    <a class="btn btn-close" href="#close"></a>
	                    <h2 class="modal-title">{{ $section['section_title'] }}</h2>
	                    </div>
	                        <div class="modal-body">
	                            <iframe src="{{ $section['google_maps'] }}" width="100%" height="100vh" frameborder="0" style="border:0" allowfullscreen></iframe>
	                        </div>
	                        <div class="modal-footer">
	                            <a href="#close" class="btn btn-default"><?php _e('Close', 'karnan'); ?></a>
	                        </div>
	                    </div><!-- /.modal-content -->
	                <a href="#close" class="backdrop"></a>
	            </div><!-- /.modal -->
	        </div>
	    @endif

	    @if(!empty($section['soundcloud']))
	        <div class="grid-md-12 gutter gutter-vertical gutter-margin">
	            {!! $section['soundcloud'] !!}
	        </div>
	    @endif

	    @if(!empty($section['gallery']))
	        <div class="grid-md-12">
	            <ul class="image-gallery grid grid-gallery">
	                @foreach($section['gallery'] as $image)
	                    <li class="grid-md-4 grid-xs-6">
	                        <a class="box lightbox-trigger" href="{{ $image['sizes']['large'] }}">
	                            {!! wp_get_attachment_image($image['ID'], array('250', '170')) !!}
	                        </a>
	                    </li>
	                @endforeach
	            </ul>
	        </div>
	    @endif

	</div>
</div>
