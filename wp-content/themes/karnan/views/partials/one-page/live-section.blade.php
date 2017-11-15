@if ($live && $live_placeholder)
<section data-section-name="live-section" class="onepage-section fluid-type">
    <div class="flex v-center full-height">
        <div class="container full-width live-container">
	        <div class="grid">
	            <div class="grid-xs-12 grid-md-12">
					<div class="player ratio-16-9" style="background-image:url('{{ $live_placeholder_url }}');">
					    <a href="#video-player-{{ $live }}" data-video-id="{{ $live }}" data-unavailable="Video playback unavailable, activate enable JavaScript to enable."></a>
					</div>
	            </div>
	        </div>
    	</div>
    </div>
</section>
@endif
