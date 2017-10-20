@if (is_array($sections) && !empty($sections))
    <ul id="one-page-elevator">
    @foreach ($sections as $elevatorKey => $elevatorItem)
        <li class="elevator-item @if($elevatorKey == 0) is-first @endif @if($elevatorKey == count($sections)-1) is-last @endif " data-label="{{ $elevatorItem['section_title'] }}" >
            <a href="#{{ sanitize_title($elevatorItem['section_title']) }}">
                <span class="height-indicator">{{ $elevatorItem['height_indicator'] }}</span>
                <span class="floor-name">{{ $elevatorItem['section_title'] }}</span>
            </a>
        </li>
    @endforeach
    </ul>
@endif
