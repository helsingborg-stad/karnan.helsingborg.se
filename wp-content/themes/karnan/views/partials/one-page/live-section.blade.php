<section data-section-name="live-section" class="onepage-section fluid-type">
    <div class="flex v-center full-height">
        <div class="container full-width live-container">
	        <div class="grid">
	            <div class="grid-xs-12 grid-md-12">
	                <article>
						@if ($live)
							<div class="player ratio-16-9" style="background-image:url('https://unsplash.it/800/800/?image=890');">
							    <a href="#video-player-{{ $live }}" data-video-id="{{ $live }}" data-unavailable="Video playback unavailable, activate enable JavaScript to enable."></a>
							</div>
						@endif
	                </article>
	            </div>
	        </div>
    	</div>
    </div>
</section>
