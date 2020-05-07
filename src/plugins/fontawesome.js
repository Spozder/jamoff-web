import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faFontAwesome,
  faFacebookSquare,
  faLinkedinIn,
  faGithub
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

export default {
  install(Vue) {
    library.add(faFontAwesome);
    library.add(faFacebookSquare);
    library.add(faEnvelope);
    library.add(faLinkedinIn);
    library.add(faGithub);
    library.add(faUserPlus);

    Vue.component("font-awesome-icon", FontAwesomeIcon);
  }
};
