import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import NplaceRewardPlaceWithIdStyle from '../Style';

const KeywordBadges = ({
  keywords,
  selectedIndex,
  onSelect,
  onDelete,
  disabled = false
}) => {
  const style = NplaceRewardPlaceWithIdStyle();
  const handleKeywordClick = (index) => {
    if (disabled) return;
    if (selectedIndex !== index) {
      onSelect(index);
    }
  };

  const handleKeywordRightClick = async (event, keywordId, keyword, index) => {
    event.preventDefault();
    if (disabled) return;
    
    const confirmMessage = 
      `키워드를 삭제하시려면 해당 키워드(${keyword})를 입력해주세요.\n` +
      `삭제 후 다시 등록할 경우 과거 데이터는 복구되지 않습니다.`;

    if (window.prompt(confirmMessage) === keyword) {
      await onDelete(keywordId, keyword, index);
    }
  };

  return (
    <div style={style.entryKeyContainer}>
      <div>
        <span className="me-3 fw-bold">목적키워드</span>
        {!keywords || keywords.length === 0 ? (
          <Badge 
            bg="secondary" 
            text="white" 
            style={{ margin: "0 2px" }}
          >
            키워드가 없습니다
          </Badge>
        ) : (
          keywords.map((keyword, index) => (
            <Badge
              key={keyword.id}
              bg={selectedIndex === index ? "warning" : "secondary"}
              text={selectedIndex === index ? "dark" : "white"}
              style={{ margin: "0 2px", cursor: "pointer" }}
              onClick={() => handleKeywordClick(index)}
              onContextMenu={(event) => 
                handleKeywordRightClick(event, keyword.id, keyword.keyword, index)
              }
            >
              <span>{keyword.keyword}</span>
              {keyword.count && (
                <span className="ms-1 opacity-75">
                  ({keyword.count})
                </span>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};

KeywordBadges.propTypes = {
  keywords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      keyword: PropTypes.string.isRequired,
      count: PropTypes.number,
      nplaceCampaignKeywordTrafficList: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          keywordTraffic: PropTypes.number.isRequired,
          createDate: PropTypes.string.isRequired
        })
      )
    })
  ),
  selectedIndex: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

KeywordBadges.defaultProps = {
  keywords: [],
  selectedIndex: null,
  disabled: false
};

export default KeywordBadges;
