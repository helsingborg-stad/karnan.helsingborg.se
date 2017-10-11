@if (isset($video) && is_array($video) && !empty($video))
    <div id="one-page-video">
        <video id="one-page-video-player" poster="" preload="auto" autobuffer loop muted>
            @foreach($video as $format => $file)
                <source src="{{ $file }}" type="video/{{ $format }}">
            @endforeach
        </video>
    </div>
@endif

