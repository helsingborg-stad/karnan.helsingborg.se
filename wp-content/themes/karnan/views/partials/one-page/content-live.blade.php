<div class="grid-md-8">
	{!! $section['content'] !!}
	<p>
        <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="btn btn btn-light"><?php _e("Show the virual guide", 'karnan'); ?></a>
    </p>
</div>
@if ($live)
<div class="grid-md-4">
	<div class="box box-filled box-filled-1 box-live">
		<h4 class="box-title"><i class="pricon pricon-play-o"></i> Webbkamera</h4>
		<div class="box-content">
			<div class="ratio-16-9">
				<div id="player-mini"></div>
		    </div>
		    <a href="#modal-target-live" class="btn btn-light btn-sm btn-block gutter gutter-sm gutter-margin gutter-top"><?php _e('Förstora', 'karnan'); ?></a>
		</div>
	    <div id="modal-target-live" class="modal modal-backdrop-white modal-small" tabindex="-1" role="dialog" aria-hidden="true">
	        <div class="modal-content material-shadow-lg">
	            <div class="modal-header">
	            </div>
	                <div class="modal-body">
	                	<div class="ratio-16-9">
							<div id="player-modal"></div>
						</div>
	                </div>
	                <div class="modal-footer">
	                    <a href="#close" class="btn btn-default"><?php _e('Close', 'karnan'); ?></a>
	                </div>
	            </div><!-- /.modal-content -->
	        <a href="#close" class="backdrop"></a>
	    </div><!-- /.modal -->
	</div>
</div>
@endif
