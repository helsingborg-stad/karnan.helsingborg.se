@if (is_array($sections) && !empty($sections))
    <ul id="elevator">
    @foreach ($sections as $elevatorItem)
        <li class="elevator-item" data-label="{{ $elevatorItem['post_title'] }}">
            <span class="height-indicator">{{ $elevatorItem['height_indicator'] }}</span>
        </li>
    @endforeach
    </ul>
@endif
