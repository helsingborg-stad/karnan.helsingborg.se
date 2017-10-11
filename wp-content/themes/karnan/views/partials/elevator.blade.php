@if (is_array($sections) && !empty($sections))
    <ul id="one-page-elevator">
    @foreach ($sections as $elevatorItem)
        <li class="elevator-item" data-label="{{ $elevatorItem['post_title'] }}">
            <a href="#{{ $elevatorItem['section_anchor'] }}">
                <span class="height-indicator">{{ $elevatorItem['height_indicator'] }}</span>
                <span class="floor-name">{{ $elevatorItem['section_name'] }}</span>
            </a>
        </li>
    @endforeach
    </ul>
@endif
