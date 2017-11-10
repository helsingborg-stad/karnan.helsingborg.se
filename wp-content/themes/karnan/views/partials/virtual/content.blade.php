<div class="grid-lg-7">
    <div class="grid">
		<div class="grid-md-12">
			<article>
		        <h2>{{ $section['section_title'] }}</h2>
		        {!! $section['content_guide'] !!}
		    </article>
		</div>

	    @if(!empty($section['google_maps']))
	    <div class="grid">
	        <div class="grid-md-6 gutter">
	            <a href="#modal-target-{{ $elevatorKey }}" class="btn btn-block btn-primary"><i class="pricon pricon-compass"></i> <?php _e('Open virtual map', 'karnan'); ?></a>
	        </div>
	        <div class="grid-md-6 gutter gutter-vertical gutter-margin">
	            <div class="audio-player">
					<audio controls controlsList="nodownload">
				    	<source src="/dist/audio/test2.mp3" type="audio/mpeg">
				 	</audio>
				 	<div class="album-art" style="background-image: url('https://picsum.photos/50/50?image=996');">
				     	<a href="#play" class="toggle-action-play pricon pricon-play"></a>
				     	<a href="#play" class="toggle-action-pause pricon pricon-pause"></a>
				 	</div>
				 	<input type="range" class="action-seek" value="0" max="100" step="0.01"/>
				</div>
	        </div>
	    </div>
	    @endif

		@if(!empty($section['google_maps']))
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
